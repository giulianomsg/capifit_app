import { createServer } from 'node:http';

import { env } from '@config/env';
import { app } from './app';
import { logger } from '@utils/logger';

async function bootstrap() {
  const server = createServer(app);

  server.listen(env.PORT, () => {
    logger.info(`API server listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  logger.error({ error }, 'Failed to bootstrap application');
  process.exit(1);
});
