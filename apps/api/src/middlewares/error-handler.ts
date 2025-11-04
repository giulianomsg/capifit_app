import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import type { HttpError } from 'http-errors';
import { ZodError } from 'zod';

import { logger } from '@utils/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const normalizedError = err instanceof ZodError ? createHttpError(422, 'Validation failed', { errors: err.flatten() }) : err;

  const httpError = createHttpError.isHttpError(normalizedError)
    ? normalizedError
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

  const isClientError = status < 500;
  const payload: Record<string, unknown> = {
    error: isClientError ? message : 'Erro interno do servidor',
  };

  if (isClientError) {
    payload.message = message;
  }

  if (status === 422) {
    if (err instanceof ZodError) {
      payload.errors = err.flatten();
    } else if (createHttpError.isHttpError(httpError) && 'errors' in httpError) {
      const validationErrors = (httpError as HttpError & { errors?: unknown }).errors;
      if (validationErrors !== undefined) {
        payload.errors = validationErrors;
      }
    }
  }

  if (createHttpError.isHttpError(httpError)) {
    const safeHttpError = httpError as HttpError & Record<string, unknown>;
    const ignoredKeys = new Set(['status', 'statusCode', 'expose', 'message', 'headers', 'stack']);

    for (const [key, value] of Object.entries(safeHttpError)) {
      if (!ignoredKeys.has(key) && !(key in payload)) {
        payload[key] = value;
      }
    }
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
