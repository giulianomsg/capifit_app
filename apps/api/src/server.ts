import 'tsconfig-paths/register';
import { createServer } from 'node:http';

import { env } from '@config/env';
import { app } from './app';
import { logger } from '@utils/logger';
import { initializeSocket, onSocketConnection } from '@lib/socket';
import { startNotificationWorker, stopNotificationWorker } from '@jobs/notification-queue';
import { markNotifications } from '@services/notification-service';
import { markThreadRead, sendMessage } from '@services/messaging-service';
import { closeRedisClient } from '@lib/redis';

async function bootstrap() {
  const server = createServer(app);
  initializeSocket(server);
  startNotificationWorker();

  let shuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    logger.info({ signal }, 'Received shutdown signal');

    try {
      await stopNotificationWorker();
      await closeRedisClient();
    } catch (error) {
      logger.error({ error }, 'Failed to stop background workers cleanly');
    }

    let exitCode = 0;

    await new Promise<void>((resolve, reject) => {
      server.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }

        logger.info('HTTP server closed');
        resolve();
      });
    }).catch((error) => {
      logger.error({ error }, 'Error while shutting down HTTP server');
      exitCode = 1;
    });

    process.exit(exitCode);
  };

  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.once(signal, () => {
      void shutdown(signal);
    });
  });

  onSocketConnection((socket) => {
    socket.on('notifications:mark-read', async (payload, callback) => {
      try {
        const result = await markNotifications(socket.data.user.id, payload);
        callback?.({ ok: true, result });
      } catch (error) {
        logger.error({ error }, 'Failed to mark notifications via socket');
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
        logger.error({ error }, 'Failed to send message via socket');
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
        logger.error({ error }, 'Failed to mark thread read via socket');
        callback?.({ ok: false, message: (error as Error).message });
      }
    });
  });

  server.listen(env.PORT, () => {
    logger.info(`API server listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  logger.error({ error }, 'Failed to bootstrap application');
  process.exit(1);
});
