import { Router } from 'express';
import createHttpError from 'http-errors';
import { z } from 'zod';

import { UserStatus } from '@prisma/client';

import { requireAuth, requireRoles } from '@middlewares/auth';
import { avatarUpload } from '@middlewares/upload';
import {
  createUserAccount,
  getCurrentUser,
  getUserProfile,
  listUsers,
  removeUserAccount,
  updateUserAccount,
  updateUserAvatar,
} from '@services/user-service';

const userStatusValues = new Set(Object.values(UserStatus));

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  roles: z
    .string()
    .optional()
    .transform((value) => (value ? value.split(',').map((role) => role.trim()).filter(Boolean) : undefined)),
  statuses: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) {
        return undefined;
      }

      const parsed = value
        .split(',')
        .map((status) => status.trim())
        .filter((status): status is UserStatus => userStatusValues.has(status as UserStatus));

      return parsed.length ? parsed : undefined;
    }),
  includeDeleted: z.coerce.boolean().optional().default(false),
});

const baseUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(8).max(20).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  roles: z.array(z.enum(['admin', 'trainer', 'client'])).nonempty(),
});

const createUserSchema = baseUserSchema.extend({
  password: z.string().min(8),
});

const updateUserSchema = baseUserSchema
  .partial()
  .extend({
    password: z.string().min(8).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, { message: 'No fields provided' });

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get('/me', async (req, res, next) => {
  try {
    const user = await getCurrentUser({ user: req.user });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

usersRouter.get('/', requireRoles('admin'), async (req, res, next) => {
  try {
    const { page, perPage, search, roles, statuses, includeDeleted } = paginationSchema.parse(req.query);
    const result = await listUsers({
      user: req.user,
      page,
      perPage,
      search,
      roles,
      statuses,
      includeDeleted,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

usersRouter.post('/', requireRoles('admin'), async (req, res, next) => {
  try {
    const payload = createUserSchema.parse(req.body);
    const user = await createUserAccount({ user: req.user, data: payload });
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
});

usersRouter.get('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw createHttpError(400, 'User id is required');
    }
    const user = await getUserProfile({ user: req.user, userId });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

usersRouter.patch('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw createHttpError(400, 'User id is required');
    }
    const payload = updateUserSchema.parse(req.body);
    const user = await updateUserAccount({ user: req.user, userId, data: payload });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

usersRouter.delete('/:userId', requireRoles('admin'), async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw createHttpError(400, 'User id is required');
    }
    await removeUserAccount({ user: req.user, userId });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

usersRouter.patch('/:userId/avatar', avatarUpload.single('avatar'), async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw createHttpError(400, 'User id is required');
    }
    const user = await updateUserAvatar({ user: req.user, userId, file: req.file });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});
