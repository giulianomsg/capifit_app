import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookie from 'cookie';
import createHttpError from 'http-errors';
import pinoHttp from 'pino-http';
import { RateLimiterMemory, type RateLimiterRes } from 'rate-limiter-flexible';

import { env } from '@config/env';
import { router } from '@routes/index';
import { errorHandler } from '@middlewares/error-handler';
import { logger } from '@utils/logger';
import { storage } from '@lib/storage';

const rateLimiter = new RateLimiterMemory({
  points: env.RATE_LIMIT_MAX,
  duration: Math.floor(env.RATE_LIMIT_WINDOW_MS / 1000),
  blockDuration: 0,
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

app.use('/uploads', express.static(storage.baseDir, { maxAge: '1d', immutable: true }));

app.use(async (req, _res, next) => {
  try {
    await rateLimiter.consume(req.ip ?? 'anonymous');
    next();
  } catch (rateLimiterRes) {
    const res = rateLimiterRes as RateLimiterRes;
    const retryAfter = Math.ceil(res.msBeforeNext / 1000);
    req.rateLimit = {
      msBeforeNext: res.msBeforeNext,
      remainingPoints: res.remainingPoints,
      consumedPoints: res.consumedPoints,
    };
    next(
      createHttpError(429, 'Too many requests', {
        headers: {
          'Retry-After': String(Number.isFinite(retryAfter) ? retryAfter : 1),
        },
      }),
    );
  }
});

app.use((req, _res, next) => {
  const cookiesHeader = req.headers.cookie;
  req.cookies = cookiesHeader ? cookie.parse(cookiesHeader) : {};
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const sortedBasePaths = [...env.API_BASE_PATHS].sort((a, b) => {
  if (a === b) {
    return 0;
  }

  if (a === '/api') {
    return -1;
  }
  if (b === '/api') {
    return 1;
  }
  if (a === '/') {
    return 1;
  }
  if (b === '/') {
    return -1;
  }

  return a.localeCompare(b);
});

sortedBasePaths.forEach((basePath) => {
  app.use(basePath, router);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.use(errorHandler);
