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

  const payload: Record<string, unknown> = {
    message: httpError.message,
    code: httpError.status,
  };

  if (httpError.status === 422 && typeof httpError.payload === 'object') {
    payload.errors = httpError.payload;
  }

  if (httpError.status >= 500) {
    payload.message = 'An unexpected error occurred. Please try again later.';
  }

  res.status(httpError.status).json(payload);
}
