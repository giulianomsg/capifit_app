import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { env } from '@config/env';
import { prisma } from '@lib/prisma';

interface AccessTokenPayload {
  sub: string;
  email: string;
  name: string;
  status: string;
  roles: string[];
  jti: string;
  exp: number;
  iat: number;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    return next(createHttpError(401, 'Authentication required'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;

    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      status: payload.status as AccessTokenPayload['status'],
      roles: payload.roles,
    };
    next();
  } catch {
    next(createHttpError(401, 'Invalid or expired access token'));
  }
}

export function requireRoles(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createHttpError(401, 'Authentication required'));
    }
    const hasRole = req.user.roles.some((role) => roles.includes(role));
    if (!hasRole) {
      return next(createHttpError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
}

export async function authenticateRefreshToken(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return next(createHttpError(401, 'Refresh token missing'));
  }

  try {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;

    if (!payload.sub || !payload.jti) {
      throw new Error('Invalid payload');
    }

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { id: payload.jti },
      include: { user: { include: { roles: { include: { role: true } } } } },
    });

    if (!tokenRecord || tokenRecord.revokedAt) {
      throw new Error('Token revoked');
    }

    if (tokenRecord.expiresAt.getTime() < Date.now()) {
      throw new Error('Token expired');
    }

    const valid = await bcrypt.compare(refreshToken, tokenRecord.tokenHash);
    if (!valid) {
      throw new Error('Token mismatch');
    }

    req.user = {
      id: tokenRecord.user.id,
      email: tokenRecord.user.email,
      name: tokenRecord.user.name,
      status: tokenRecord.user.status,
      roles: tokenRecord.user.roles.map((r) => r.role.name),
    };
    req.refreshTokenId = tokenRecord.id;

    next();
  } catch (error) {
    next(createHttpError(401, 'Invalid refresh token', { cause: error }));
  }
}
