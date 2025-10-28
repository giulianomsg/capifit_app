import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookie from 'cookie';
import createHttpError from 'http-errors';
import pinoHttp from 'pino-http';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import 'express-async-errors';

import { env } from '@config/env';
import { router } from '@routes/index';
import { errorHandler } from '@middlewares/error-handler';
import { logger } from '@utils/logger';

const rateLimiter = new RateLimiterMemory({
  points: env.RATE_LIMIT_MAX,
  duration: Math.floor(env.RATE_LIMIT_WINDOW_MS / 1000),
});

export const app = express();

app.disable('x-powered-by');

app.use(
  pinoHttp({
    logger,
    customLogLevel: (res, err) => {
      if (res.statusCode >= 500 || err) {
        return 'error';
      }
      if (res.statusCode >= 400) {
        return 'warn';
      }
      return 'info';
    },
  }),
);

app.use((req, res, next) => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  if (forwardedProto && typeof forwardedProto === 'string') {
    req.headers['x-forwarded-proto'] = forwardedProto.split(',')[0];
  }
  next();
});

app.use(helmet());
app.use(
  cors({
    origin: [env.FRONTEND_URL],
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip ?? 'anonymous')
    .then(() => next())
    .catch(() => {
      next(createHttpError(429, 'Too many requests'));
    });
});

app.use((req, _res, next) => {
  const cookiesHeader = req.headers.cookie;
  req.cookies = cookiesHeader ? cookie.parse(cookiesHeader) : {};
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', router);

app.use((_req, _res, next) => {
  next(createHttpError(404, 'Resource not found'));
});

app.use(errorHandler);
