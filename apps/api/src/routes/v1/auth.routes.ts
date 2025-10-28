import { Router } from 'express';
import createHttpError from 'http-errors';
import { z } from 'zod';

import { authenticateRefreshToken, requireAuth } from '@middlewares/auth';
import {
  authenticateUser,
  issueTokensFromRefresh,
  registerUser,
  revokeToken,
} from '@services/auth-service';
import { env } from '@config/env';

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8),
  roles: z.array(z.enum(['admin', 'trainer', 'client'])).nonempty(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const authResponse = (data: {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    status: string;
    roles: string[];
  };
}) => data;

const secureCookie = env.NODE_ENV === 'production';

const cookieOptions = (expires?: Date) => ({
  httpOnly: true,
  secure: secureCookie,
  sameSite: 'strict' as const,
  path: '/',
  ...(expires ? { expires } : {}),
});

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      throw createHttpError(422, 'Validation failed', { errors: result.error.flatten() });
    }
    const authResult = await registerUser(result.data);

    res
      .cookie('refreshToken', authResult.refreshToken, cookieOptions(authResult.refreshTokenExpiresAt))
      .status(201)
      .json(
        authResponse({
          token: authResult.accessToken,
          user: authResult.user,
        }),
      );
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      throw createHttpError(422, 'Validation failed', { errors: result.error.flatten() });
    }
    const authResult = await authenticateUser(result.data);

    res
      .cookie('refreshToken', authResult.refreshToken, cookieOptions(authResult.refreshTokenExpiresAt))
      .json(
        authResponse({
          token: authResult.accessToken,
          user: authResult.user,
        }),
      );
  } catch (error) {
    next(error);
  }
});

authRouter.post('/refresh', authenticateRefreshToken, async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Session not found');
    }

    const result = await issueTokensFromRefresh(req.user.id);

    res
      .cookie('refreshToken', result.refreshToken, cookieOptions(result.refreshTokenExpiresAt))
      .json(
        authResponse({
          token: result.accessToken,
          user: result.user,
        }),
      );
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', authenticateRefreshToken, async (req, res, next) => {
  try {
    if (!req.refreshTokenId) {
      throw createHttpError(400, 'Refresh token not registered');
    }

    await revokeToken(req.refreshTokenId, req.user?.id);

    res.clearCookie('refreshToken', cookieOptions()).status(204).send();
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', requireAuth, (req, res) => {
  if (!req.user) {
    throw createHttpError(401, 'Authentication required');
  }
  res.json({ user: req.user });
});
