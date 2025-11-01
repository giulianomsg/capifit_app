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
      socket.data.user = verifyAccessToken(token);
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

    socket.on('auth:refresh', (payload: { token?: string }, callback?: (response: { status: 'ok' } | { status: 'error'; reason: string }) => void) => {
      const nextToken = typeof payload?.token === 'string' ? payload.token : null;
      if (!nextToken) {
        logger.warn('Socket token refresh attempted without token');
        callback?.({ status: 'error', reason: 'token-missing' });
        socket.emit('auth:error', { reason: 'token-missing' });
        socket.disconnect(true);
        return;
      }

      try {
        const previousUserId = socket.data.user?.id;
        const nextUserContext = verifyAccessToken(nextToken);
        socket.data.user = nextUserContext;

        if (previousUserId && previousUserId !== nextUserContext.id) {
          socket.leave(getUserRoom(previousUserId));
          socket.join(getUserRoom(nextUserContext.id));
        }

        callback?.({ status: 'ok' });
      } catch (error) {
        logger.warn({ error }, 'Socket token refresh failed');
        callback?.({ status: 'error', reason: 'invalid-token' });
        socket.emit('auth:error', { reason: 'invalid-token' });
        socket.disconnect(true);
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

function verifyAccessToken(token: string): SocketUserContext {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    roles: payload.roles,
  } satisfies SocketUserContext;
}
