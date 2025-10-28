import { AnyZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export const validateRequest = (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!result.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Validation failed',
        errors: result.error.flatten()
      });
    }

    Object.assign(req, result.data);
    return next();
  };
