import { Request, Response, NextFunction } from 'express';

export const mockAuth = (req: Request, _res: Response, next: NextFunction) => {
  const fromHeader = req.header('x-user-id');
  if (fromHeader) {
    req.userId = fromHeader;
  }
  next();
};
