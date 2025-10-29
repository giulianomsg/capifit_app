import IORedis from 'ioredis';

import { env } from '@config/env';
import { logger } from '@utils/logger';

let client: IORedis | null | undefined;

export function getRedisClient(): IORedis | null {
  if (client !== undefined) {
    return client;
  }

  if (!env.REDIS_URL) {
    logger.warn('Redis URL not configured. Falling back to in-memory dispatch.');
    client = null;
    return client;
  }

  try {
    client = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    client.on('error', (error) => {
      logger.error({ error }, 'Redis connection error');
    });

    void client.connect().catch((error) => {
      logger.error({ error }, 'Failed to connect to Redis');
    });

    logger.info('Redis connection initialized');
    return client;
  } catch (error) {
    logger.error({ error }, 'Unable to initialize Redis client');
    client = null;
    return client;
  }
}

export async function closeRedisClient() {
  if (!client) {
    return;
  }

  if (client.status !== 'end') {
    try {
      await client.quit();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error({ error }, 'Failed to close Redis connection');
      try {
        client.disconnect();
      } catch (disconnectError) {
        logger.error({ error: disconnectError }, 'Failed to forcefully disconnect Redis client');
      }
    }
  }

  client = null;
}
