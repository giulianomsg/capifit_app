import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { logger } from '@utils/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const httpError = createHttpError.isHttpError(err)
    ? err
    : createHttpError(500, 'Erro interno do servidor', { expose: false });

  const status =
    httpError.status ||
    (typeof err === 'object' && err !== null && 'statusCode' in err && typeof (err as any).statusCode === 'number'
      ? (err as any).statusCode
      : undefined) ||
    500;

  const message = (httpError.message ?? 'Erro interno do servidor').trim() || 'Erro interno do servidor';

  if (process.env.NODE_ENV !== 'test') {
    console.error(err); // eslint-disable-line no-console
  }

  logger.error(
    {
      err,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      statusCode: status,
      rateLimit: req.rateLimit,
    },
    'Request failed',
  );

  const payload: Record<string, unknown> = { error: status >= 500 ? 'Erro interno do servidor' : message };

  if (status === 422 && typeof httpError.payload === 'object' && httpError.payload !== null) {
    payload.details = httpError.payload;
  }

  if (createHttpError.isHttpError(httpError) && httpError.headers && typeof httpError.headers === 'object') {
    for (const [header, value] of Object.entries(httpError.headers)) {
      if (typeof value === 'string') {
        res.setHeader(header, value);
      }
    }
  }

  res.status(status).json(payload);
}
