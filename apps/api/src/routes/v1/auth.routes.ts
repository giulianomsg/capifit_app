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
import { getCurrentUser } from '@services/user-service';

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8),
  roles: z.array(z.enum(['admin', 'trainer', 'client'])).min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

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
    const payload: RegisterInput = registerSchema.parse(req.body);
    const authResult = await registerUser(payload);

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
    if (error instanceof z.ZodError) {
      return next(createHttpError(422, 'Validation failed', { errors: error.flatten() }));
    }
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const payload: LoginInput = loginSchema.parse(req.body);
    const authResult = await authenticateUser(payload);

    res
      .cookie('refreshToken', authResult.refreshToken, cookieOptions(authResult.refreshTokenExpiresAt))
      .json(
        authResponse({
          token: authResult.accessToken,
          user: authResult.user,
        }),
      );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createHttpError(422, 'Validation failed', { errors: error.flatten() }));
    }
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

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await getCurrentUser({ user: req.user });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});
