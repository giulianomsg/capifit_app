import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { logger } from '@utils/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const httpError = createHttpError.isHttpError(err)
    ? err
    : createHttpError(500, 'Internal server error', { expose: false });

  const statusCode =
    httpError.status ||
    (typeof err === 'object' && err !== null && 'statusCode' in err && typeof (err as any).statusCode === 'number'
      ? (err as any).statusCode
      : undefined) ||
    500;

  const message = statusCode >= 500 ? 'Erro interno do servidor' : httpError.message;

  const payload: Record<string, unknown> = {
    error: message,
  };

  if (statusCode === 422 && typeof httpError.payload === 'object') {
    payload.details = httpError.payload;
  }

  logger.error(
    {
      err,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      statusCode,
    },
    'Request failed',
  );

  // Ensure we surface a stack trace in local development for debugging consistency
  if (process.env.NODE_ENV !== 'production') {
    console.error(err); // eslint-disable-line no-console
  }

  res.status(statusCode).json(payload);
}
