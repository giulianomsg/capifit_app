import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { logger } from '@utils/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const httpError = createHttpError.isHttpError(err)
    ? err
    : createHttpError(500, 'Internal server error', { expose: false });

  logger.error(
    {
      err,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      statusCode: httpError.status,
    },
    'Request failed',
  );

  const statusCode = httpError.status ?? 500;

  let message = httpError.message;
  if (statusCode >= 500) {
    message = 'Erro interno do servidor';
  }

  const payload: Record<string, unknown> = {
    error: message,
  };

  if (statusCode === 422 && typeof httpError.payload === 'object') {
    payload.details = httpError.payload;
  }

  res.status(statusCode).json(payload);
}
