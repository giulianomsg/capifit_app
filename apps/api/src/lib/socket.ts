import type { Server as HttpServer } from 'node:http';

import { Server, type Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

import { env } from '@config/env';
import { logger } from '@utils/logger';

type AccessTokenPayload = {
  sub: string;
  email: string;
  name: string;
  roles: string[];
  exp: number;
};

export interface SocketUserContext {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

type AuthenticatedSocket = Socket & { data: { user: SocketUserContext } };

type ConnectionHandler = (socket: AuthenticatedSocket) => void;

let io: Server | null = null;
const connectionHandlers = new Set<ConnectionHandler>();

export function initializeSocket(server: HttpServer) {
  io = new Server(server, {
    path: env.WEBSOCKET_PATH,
    cors: {
      origin: env.WEBSOCKET_ALLOWED_ORIGINS ?? [env.FRONTEND_URL],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token =
      typeof socket.handshake.auth?.token === 'string'
        ? socket.handshake.auth?.token
        : socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
      socket.data.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        roles: payload.roles,
      } satisfies SocketUserContext;
      next();
    } catch (error) {
      logger.warn({ error }, 'Socket authentication failed');
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const room = getUserRoom(socket.data.user.id);
    socket.join(room);
    logger.info({ userId: socket.data.user.id, socketId: socket.id }, 'Socket connected');

    connectionHandlers.forEach((handler) => {
      try {
        handler(socket);
      } catch (error) {
        logger.error({ error }, 'Socket connection handler failed');
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info({ userId: socket.data.user.id, socketId: socket.id, reason }, 'Socket disconnected');
    });
  });

  logger.info('Socket.IO server initialized');
}

export function onSocketConnection(handler: ConnectionHandler) {
  connectionHandlers.add(handler);
}

export function emitToUser<T>(userId: string, event: string, payload: T) {
  if (!io) {
    logger.warn({ event }, 'Socket server not initialized, skipping emit');
    return;
  }

  io.to(getUserRoom(userId)).emit(event, payload);
}

export function broadcast(event: string, payload: unknown) {
  if (!io) {
    logger.warn({ event }, 'Socket server not initialized, skipping broadcast');
    return;
  }
  io.emit(event, payload);
}

function getUserRoom(userId: string) {
  return `user:${userId}`;
}
