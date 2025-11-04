import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import { Prisma, UserStatus } from '@prisma/client';

import { env } from '@config/env';
import { prisma } from '@lib/prisma';
import { storage } from '@lib/storage';
import { recordAuditLog } from '@repositories/user-repository';

interface AuthenticatedUser {
  id: string;
  roles: string[];
  email: string;
  name: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  status?: UserStatus;
  roles: string[];
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  status?: UserStatus;
  roles?: string[];
  password?: string;
}

type UserWithRelations = Prisma.UserGetPayload<{
  include: { roles: { include: { role: true } } };
}>;

function ensureAdmin(user: AuthenticatedUser | undefined) {
  if (!user || !user.roles.includes('admin')) {
    throw createHttpError(403, 'Administrator privileges are required');
  }
}

function ensureSelfOrAdmin(user: AuthenticatedUser | undefined, targetId: string) {
  if (!user) {
    throw createHttpError(401, 'Authentication required');
  }
  if (user.id !== targetId && !user.roles.includes('admin')) {
    throw createHttpError(403, 'You do not have permission to access this resource');
  }
}

function serializeUser(user: UserWithRelations) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    status: user.status,
    roles: user.roles.map((role) => role.role.name),
    avatarUrl: user.avatarUrl ? storage.buildPublicUrl(user.avatarUrl) : null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
  };
}

export async function listUsers(params: {
  user: AuthenticatedUser | undefined;
  page?: number;
  perPage?: number;
  search?: string;
  roles?: string[];
  statuses?: UserStatus[];
  includeDeleted?: boolean;
}) {
  ensureAdmin(params.user);

  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(100, Math.max(1, params.perPage ?? 20));

  const where: Prisma.UserWhereInput = {
    ...(params.includeDeleted ? {} : { deletedAt: null }),
  };

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: Prisma.QueryMode.insensitive } },
      { email: { contains: params.search, mode: Prisma.QueryMode.insensitive } },
      { phone: { contains: params.search, mode: Prisma.QueryMode.insensitive } },
    ];
  }

  if (params.statuses?.length) {
    where.status = { in: params.statuses };
  }

  if (params.roles?.length) {
    where.roles = {
      some: {
        role: { name: { in: params.roles } },
      },
    };
  }

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: { roles: { include: { role: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  return {
    data: users.map(serializeUser),
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    },
  };
}

export async function getUserProfile(params: { user: AuthenticatedUser | undefined; userId: string }) {
  ensureSelfOrAdmin(params.user, params.userId);

  const user = await prisma.user.findFirst({
    where: { id: params.userId },
    include: { roles: { include: { role: true } } },
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  return serializeUser(user);
}

export async function getCurrentUser(params: { user: AuthenticatedUser | undefined }) {
  if (!params.user) {
    throw createHttpError(401, 'Authentication required');
  }

  const user = await prisma.user.findFirst({
    where: { id: params.user.id },
    include: { roles: { include: { role: true } } },
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  return serializeUser(user);
}

export async function createUserAccount(params: {
  user: AuthenticatedUser | undefined;
  data: CreateUserData;
}) {
  ensureAdmin(params.user);

  const existing = await prisma.user.findUnique({ where: { email: params.data.email } });
  if (existing) {
    throw createHttpError(409, 'E-mail already registered');
  }

  const roles = await prisma.role.findMany({ where: { name: { in: params.data.roles } } });
  if (!roles.length) {
    throw createHttpError(400, 'At least one valid role must be provided');
  }

  const passwordHash = await bcrypt.hash(params.data.password, env.PASSWORD_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: params.data.name,
      email: params.data.email,
      phone: params.data.phone,
      status: params.data.status ?? UserStatus.ACTIVE,
      passwordHash,
      roles: {
        create: roles.map((role) => ({ role: { connect: { id: role.id } } })),
      },
    },
    include: { roles: { include: { role: true } } },
  });

  await recordAuditLog({
    userId: params.user?.id,
    action: 'user.create',
    entity: 'user',
    entityId: user.id,
    metadata: { createdBy: params.user?.id },
  });

  return serializeUser(user);
}

export async function updateUserAccount(params: {
  user: AuthenticatedUser | undefined;
  userId: string;
  data: UpdateUserData;
}) {
  ensureSelfOrAdmin(params.user, params.userId);

  const existing = await prisma.user.findFirst({
    where: { id: params.userId },
    include: { roles: { include: { role: true } } },
  });

  if (!existing) {
    throw createHttpError(404, 'User not found');
  }

  if (params.data.email && params.data.email !== existing.email) {
    ensureAdmin(params.user);
    const emailOwner = await prisma.user.findUnique({ where: { email: params.data.email } });
    if (emailOwner) {
      throw createHttpError(409, 'E-mail already registered');
    }
  }

  const updateData: Prisma.UserUpdateInput = {};

  if (params.data.name) updateData.name = params.data.name;
  if (params.data.phone !== undefined) updateData.phone = params.data.phone;
  if (params.data.email) updateData.email = params.data.email;

  if (params.data.status) {
    ensureAdmin(params.user);
    updateData.status = params.data.status;
  }

  if (params.data.roles) {
    ensureAdmin(params.user);
    const roles = await prisma.role.findMany({ where: { name: { in: params.data.roles } } });
    if (!roles.length) {
      throw createHttpError(400, 'At least one valid role must be provided');
    }
    updateData.roles = {
      deleteMany: {},
      create: roles.map((role) => ({ role: { connect: { id: role.id } } })),
    };
  }

  if (params.data.password) {
    if (params.data.password.length < 8) {
      throw createHttpError(422, 'Password must contain at least 8 characters');
    }
    updateData.passwordHash = await bcrypt.hash(params.data.password, env.PASSWORD_SALT_ROUNDS);
  }

  const updated = await prisma.user.update({
    where: { id: params.userId },
    data: updateData,
    include: { roles: { include: { role: true } } },
  });

  await recordAuditLog({
    userId: params.user?.id,
    action: 'user.update',
    entity: 'user',
    entityId: params.userId,
    metadata: { updatedFields: Object.keys(params.data) },
  });

  return serializeUser(updated);
}

export async function removeUserAccount(params: { user: AuthenticatedUser | undefined; userId: string }) {
  ensureAdmin(params.user);

  const existing = await prisma.user.findUnique({ where: { id: params.userId } });
  if (!existing) {
    throw createHttpError(404, 'User not found');
  }

  await prisma.user.update({
    where: { id: params.userId },
    data: { deletedAt: new Date(), status: UserStatus.INACTIVE },
  });

  await recordAuditLog({
    userId: params.user?.id,
    action: 'user.delete',
    entity: 'user',
    entityId: params.userId,
  });
}

export async function updateUserAvatar(params: {
  user: AuthenticatedUser | undefined;
  userId: string;
  file: Express.Multer.File | undefined;
}) {
  ensureSelfOrAdmin(params.user, params.userId);

  if (!params.file) {
    throw createHttpError(400, 'Avatar file is required');
  }

  const existing = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { id: true, avatarUrl: true },
  });

  if (!existing) {
    await storage.removeFile(storage.relativeFromFile(params.file.path));
    throw createHttpError(404, 'User not found');
  }

  const relativePath = storage.relativeFromFile(params.file.path);

  const updated = await prisma.user.update({
    where: { id: params.userId },
    data: { avatarUrl: relativePath },
    include: { roles: { include: { role: true } } },
  });

  if (existing.avatarUrl && existing.avatarUrl !== relativePath) {
    await storage.removeFile(existing.avatarUrl);
  }

  await recordAuditLog({
    userId: params.user?.id,
    action: 'user.avatar.update',
    entity: 'user',
    entityId: params.userId,
  });

  return serializeUser(updated);
}
