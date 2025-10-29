import './utils/pg-mem';

import { createServer, type Server as HttpServer } from 'node:http';
import type { AddressInfo } from 'node:net';

import request from 'supertest';
import { io as createClient, type Socket } from 'socket.io-client';
import type { Express } from 'express';
import type { PrismaClient } from '@prisma/client';
import { NotificationCategory } from '@prisma/client';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  applyMigrations,
  clearDatabase,
  configureTestDatabaseEnv,
  seedBaseData,
} from './utils/database';
import { initializeSocket, onSocketConnection } from '../src/lib/socket';
import { markNotifications } from '../src/services/notification-service';
import { markThreadRead, sendMessage } from '../src/services/messaging-service';

const SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS ?? '10');

interface UserSeedInput {
  name: string;
  email: string;
  password: string;
  roles: string[];
}

async function authenticate(app: Express, email: string, password: string) {
  const response = await request(app).post('/api/v1/auth/login').send({ email, password });
  expect(response.status).toBe(200);
  return response.body.token as string;
}

async function createUserWithRoles(prisma: PrismaClient, data: UserSeedInput) {
  const roleRecords = await prisma.role.findMany({ where: { name: { in: data.roles } } });
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.default.hash(data.password, SALT_ROUNDS);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      roles: {
        create: roleRecords.map((role) => ({ role: { connect: { id: role.id } } })),
      },
    },
  });
}

describe('Realtime socket flows', () => {
  let app: Express;
  let prisma: PrismaClient;
  let server: HttpServer;
  let baseUrl: string;

  let trainerToken: string;
  let trainerSocket: Socket | null;

  let clientId: string;
  let clientToken: string;
  let clientSocket: Socket | null;

  beforeAll(async () => {
    configureTestDatabaseEnv();
    await applyMigrations();

    ({ prisma } = await import('../src/lib/prisma'));
    ({ app } = await import('../src/app'));

    const httpServer = createServer(app);
    initializeSocket(httpServer);

    onSocketConnection((socket) => {
      socket.on('notifications:mark-read', async (payload, callback) => {
        try {
          const result = await markNotifications(socket.data.user.id, payload);
          callback?.({ ok: true, result });
        } catch (error) {
          callback?.({ ok: false, message: (error as Error).message });
        }
      });

      socket.on('messaging:send', async ({ threadId, message }, callback) => {
        try {
          if (!threadId) {
            throw new Error('threadId is required');
          }
          const result = await sendMessage(socket.data.user.id, threadId, message);
          callback?.({ ok: true, result });
        } catch (error) {
          callback?.({ ok: false, message: (error as Error).message });
        }
      });

      socket.on('messaging:mark-read', async ({ threadId, payload }, callback) => {
        try {
          if (!threadId) {
            throw new Error('threadId is required');
          }
          await markThreadRead(socket.data.user.id, threadId, payload);
          callback?.({ ok: true });
        } catch (error) {
          callback?.({ ok: false, message: (error as Error).message });
        }
      });
    });

    await new Promise<void>((resolve) => {
      httpServer.listen(0, resolve);
    });

    const address = httpServer.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
    server = httpServer;
  });

  beforeEach(async () => {
    await clearDatabase(prisma);
    await seedBaseData(prisma);

    await authenticate(app, ADMIN_EMAIL, ADMIN_PASSWORD);

    const trainer = await createUserWithRoles(prisma, {
      name: 'Coach Test',
      email: 'coach@test.com',
      password: 'Trainer123!',
      roles: ['trainer'],
    });
    trainerToken = await authenticate(app, trainer.email, 'Trainer123!');

    const client = await createUserWithRoles(prisma, {
      name: 'Client Test',
      email: 'client@test.com',
      password: 'Client123!',
      roles: ['client'],
    });
    clientId = client.id;
    clientToken = await authenticate(app, client.email, 'Client123!');

    trainerSocket = await connectSocket(baseUrl, trainerToken);
    clientSocket = await connectSocket(baseUrl, clientToken);
  });

  afterEach(() => {
    for (const socket of [trainerSocket, clientSocket]) {
      if (socket) {
        socket.removeAllListeners();
        if (socket.connected) {
          socket.disconnect();
        }
      }
    }
    trainerSocket = null;
    clientSocket = null;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    await prisma.$disconnect();
  });

  it('delivers realtime message and notification events and supports marking unread counts via socket', async () => {
    const threadResponse = await request(app)
      .post('/api/v1/messaging/threads')
      .set('Authorization', `Bearer ${trainerToken}`)
      .send({ participantIds: [clientId], title: 'Sessão de avaliação' });

    expect(threadResponse.status).toBe(201);
    const threadId = threadResponse.body.id as string;

    const messageEventPromise = waitForEvent(clientSocket!, 'message:new');
    const notificationEventPromise = waitForEvent(clientSocket!, 'notification:new');

    const messageResponse = await request(app)
      .post(`/api/v1/messaging/threads/${threadId}/messages`)
      .set('Authorization', `Bearer ${trainerToken}`)
      .send({ content: 'Lembrete: avaliação amanhã às 9h.' });

    expect(messageResponse.status).toBe(201);

    const messageEvent = (await messageEventPromise) as { id: string; threadId: string; content: string };
    const notificationEvent = (await notificationEventPromise) as { id: string; category: NotificationCategory };

    expect(messageEvent.threadId).toBe(threadId);
    expect(messageEvent.content).toContain('avaliação');
    expect(notificationEvent.category).toBe(NotificationCategory.MESSAGE);

    const markMessageResult = await emitWithAck(clientSocket!, 'messaging:mark-read', {
      threadId,
      payload: { lastMessageId: messageEvent.id },
    });
    expect(markMessageResult).toMatchObject({ ok: true });

    const participant = await prisma.threadParticipant.findUniqueOrThrow({
      where: { threadId_userId: { threadId, userId: clientId } },
    });
    expect(participant.lastReadAt).not.toBeNull();

    const markNotificationResult = await emitWithAck(clientSocket!, 'notifications:mark-read', {
      ids: [notificationEvent.id],
      read: true,
    });
    expect(markNotificationResult).toMatchObject({ ok: true, result: { count: 1 } });

    const notificationRecord = await prisma.notification.findUniqueOrThrow({ where: { id: notificationEvent.id } });
    expect(notificationRecord.readAt).not.toBeNull();
  });

  it('keeps sockets authenticated after token refresh and allows realtime messaging', async () => {
    const refreshResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'coach@test.com', password: 'Trainer123!' });

    expect(refreshResponse.status).toBe(200);
    const refreshedToken = refreshResponse.body.token as string;

    const refreshAck = await emitWithAck(trainerSocket!, 'auth:refresh', { token: refreshedToken });
    expect(refreshAck).toMatchObject({ status: 'ok' });
    expect(trainerSocket!.connected).toBe(true);

    const threadResponse = await request(app)
      .post('/api/v1/messaging/threads')
      .set('Authorization', `Bearer ${trainerToken}`)
      .send({ participantIds: [clientId] });
    expect(threadResponse.status).toBe(201);
    const threadId = threadResponse.body.id as string;

    const incomingMessagePromise = waitForEvent(clientSocket!, 'message:new');

    const sendResult = await emitWithAck(trainerSocket!, 'messaging:send', {
      threadId,
      message: { content: 'Mensagem enviada após refresh.' },
    });

    expect(sendResult).toMatchObject({ ok: true });

    const delivered = (await incomingMessagePromise) as { content: string; threadId: string };
    expect(delivered.threadId).toBe(threadId);
    expect(delivered.content).toContain('após refresh');
  });
});

function connectSocket(baseUrl: string, token: string) {
  const origin = process.env.FRONTEND_URL ?? 'http://localhost:5173';
  return new Promise<Socket>((resolve, reject) => {
    const socket = createClient(baseUrl, {
      path: process.env.WEBSOCKET_PATH ?? '/socket.io',
      transports: ['websocket'],
      auth: { token },
      extraHeaders: { Origin: origin },
      reconnection: false,
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error('Timed out connecting to realtime server'));
    }, 5000);

    socket.on('connect', () => {
      clearTimeout(timeout);
      resolve(socket);
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      socket.disconnect();
      reject(error);
    });
  });
}

function waitForEvent(socket: Socket, event: string) {
  return new Promise<unknown>((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.off(event, handler);
      reject(new Error(`Timeout waiting for ${event}`));
    }, 5000);

    function handler(payload: unknown) {
      clearTimeout(timeout);
      resolve(payload);
    }

    socket.once(event, handler);
  });
}

function emitWithAck(socket: Socket, event: string, payload: unknown) {
  return new Promise<any>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout waiting ack for ${event}`));
    }, 5000);

    socket.emit(event, payload, (response: unknown) => {
      clearTimeout(timeout);
      resolve(response);
    });
  });
}
