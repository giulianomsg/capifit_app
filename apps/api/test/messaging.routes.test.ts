import './utils/pg-mem';

import bcrypt from 'bcryptjs';
import request from 'supertest';
import type { Express } from 'express';
import type { PrismaClient } from '@prisma/client';
import { NotificationCategory } from '@prisma/client';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  applyMigrations,
  clearDatabase,
  configureTestDatabaseEnv,
  seedBaseData,
} from './utils/database';

const SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS ?? '10');

let app: Express;
let prisma: PrismaClient;
let trainerToken: string;
let clientToken: string;
let trainerId: string;
let clientId: string;

async function authenticate(email: string, password: string) {
  const response = await request(app).post('/api/v1/auth/login').send({ email, password });
  expect(response.status).toBe(200);
  return response.body.token as string;
}

async function createUserWithRoles(data: { name: string; email: string; password: string; roles: string[] }) {
  const roleRecords = await prisma.role.findMany({ where: { name: { in: data.roles } } });
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: await bcrypt.hash(data.password, SALT_ROUNDS),
      roles: {
        create: roleRecords.map((role) => ({ role: { connect: { id: role.id } } })),
      },
    },
  });

  return user;
}

async function createThreadWithUnreadMessage(title: string, messageSuffix: string) {
  const threadResponse = await request(app)
    .post('/api/v1/messaging/threads')
    .set('Authorization', `Bearer ${trainerToken}`)
    .send({ participantIds: [clientId], title });

  expect(threadResponse.status).toBe(201);
  const threadId = threadResponse.body.id as string;

  const messageResponse = await request(app)
    .post(`/api/v1/messaging/threads/${threadId}/messages`)
    .set('Authorization', `Bearer ${clientToken}`)
    .send({ content: `Mensagem do cliente ${messageSuffix}` });

  expect(messageResponse.status).toBe(201);

  return { threadId, messageId: messageResponse.body.id as string };
}

describe('Messaging routes', () => {
  beforeAll(async () => {
    configureTestDatabaseEnv();
    await applyMigrations();

    ({ prisma } = await import('../src/lib/prisma'));
    ({ app } = await import('../src/app'));
  });

  beforeEach(async () => {
    await clearDatabase(prisma);
    await seedBaseData(prisma);
    await authenticate(ADMIN_EMAIL, ADMIN_PASSWORD); // ensure auth service seeded tokens

    const trainer = await createUserWithRoles({
      name: 'Coach Test',
      email: 'coach@test.com',
      password: 'Trainer123!',
      roles: ['trainer'],
    });
    trainerId = trainer.id;
    trainerToken = await authenticate(trainer.email, 'Trainer123!');

    const client = await createUserWithRoles({
      name: 'Client Test',
      email: 'client@test.com',
      password: 'Client123!',
      roles: ['client'],
    });
    clientId = client.id;
    clientToken = await authenticate(client.email, 'Client123!');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a new thread with initial message', async () => {
    const response = await request(app)
      .post('/api/v1/messaging/threads')
      .set('Authorization', `Bearer ${trainerToken}`)
      .send({
        title: 'Revisão semanal',
        participantIds: [clientId],
        initialMessage: 'Olá! Vamos revisar seu treino desta semana.',
      });

    expect(response.status).toBe(201);
    expect(response.body.participants).toHaveLength(2);
    expect(response.body.messages.length).toBeGreaterThanOrEqual(1);
  });

  it('allows trainers to send messages and generates notifications for clients', async () => {
    const threadResponse = await request(app)
      .post('/api/v1/messaging/threads')
      .set('Authorization', `Bearer ${trainerToken}`)
      .send({ participantIds: [clientId] });

    const threadId = threadResponse.body.id as string;

    const messageResponse = await request(app)
      .post(`/api/v1/messaging/threads/${threadId}/messages`)
      .set('Authorization', `Bearer ${trainerToken}`)
      .send({ content: 'Lembre-se da sessão de alongamento amanhã.' });

    expect(messageResponse.status).toBe(201);
    expect(messageResponse.body.content).toContain('alongamento');

    const notifications = await prisma.notification.findMany({ where: { userId: clientId } });
    expect(notifications.some((notification) => notification.category === NotificationCategory.MESSAGE)).toBe(true);
  });

  it('lists threads for the participant', async () => {
    await request(app)
      .post('/api/v1/messaging/threads')
      .set('Authorization', `Bearer ${trainerToken}`)
      .send({ participantIds: [clientId], title: 'Sessão de feedback' });

    const response = await request(app)
      .get('/api/v1/messaging/threads')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('marks a thread as read', async () => {
    const threadResponse = await request(app)
      .post('/api/v1/messaging/threads')
      .set('Authorization', `Bearer ${trainerToken}`)
      .send({ participantIds: [clientId], initialMessage: 'Teste' });

    const threadId = threadResponse.body.id as string;
    const messageId = threadResponse.body.messages[0].id as string;

    const markResponse = await request(app)
      .post(`/api/v1/messaging/threads/${threadId}/read`)
      .set('Authorization', `Bearer ${trainerToken}`)
      .send({ lastMessageId: messageId });

    expect(markResponse.status).toBe(204);

    const participant = await prisma.threadParticipant.findUniqueOrThrow({
      where: { threadId_userId: { threadId, userId: trainerId } },
    });
    expect(participant.lastReadAt).not.toBeNull();
  });

  it('paginates threads, surfaces unread counters and supports search filters', async () => {
    const createdThreads = [] as { threadId: string; messageId: string }[];
    for (let index = 0; index < 5; index += 1) {
      const result = await createThreadWithUnreadMessage(`Sessão ${index + 1}`, `${index + 1}`);
      createdThreads.push(result);
    }

    // Mark the first thread as read so it no longer counts as unread.
    const first = createdThreads[0];
    await request(app)
      .post(`/api/v1/messaging/threads/${first.threadId}/read`)
      .set('Authorization', `Bearer ${trainerToken}`)
      .send({ lastMessageId: first.messageId });

    const paginatedResponse = await request(app)
      .get('/api/v1/messaging/threads')
      .set('Authorization', `Bearer ${trainerToken}`)
      .query({ page: 2, perPage: 2 });

    expect(paginatedResponse.status).toBe(200);
    expect(paginatedResponse.body.meta).toMatchObject({
      page: 2,
      perPage: 2,
      total: 5,
      totalPages: 3,
    });

    expect(paginatedResponse.body.data).toHaveLength(2);
    expect(paginatedResponse.body.data.every((thread: any) => typeof thread.unreadCount === 'number')).toBe(true);

    const unreadCounts = paginatedResponse.body.data.map((thread: any) => thread.unreadCount);
    expect(unreadCounts.some((count: number) => count === 1)).toBe(true);

    const searchResponse = await request(app)
      .get('/api/v1/messaging/threads')
      .set('Authorization', `Bearer ${trainerToken}`)
      .query({ search: 'Sessão 3' });

    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body.meta.total).toBe(1);
    expect(searchResponse.body.data[0].title).toBe('Sessão 3');
  });
});
