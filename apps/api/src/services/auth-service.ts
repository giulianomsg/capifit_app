import { randomUUID } from 'node:crypto';

import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

import { env } from '@config/env';
import { prisma } from '@lib/prisma';
import {
  createUser,
  findRolesByName,
  findUserByEmail,
  findUserById,
  recordAuditLog,
  revokeRefreshToken,
  revokeUserRefreshTokens,
} from '@repositories/user-repository';

function serializeUser(user: User & { roles: { role: { name: string } }[] }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    status: user.status,
    roles: user.roles.map((role) => role.role.name),
  };
}

function signAccessToken(user: User & { roles: { role: { name: string } }[] }) {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    status: user.status,
    roles: user.roles.map((role) => role.role.name),
    jti: randomUUID(),
  };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
  });

  return { accessToken };
}

async function signRefreshToken(userId: string) {
  const tokenId = randomUUID();
  const expiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL * 1000);
  const refreshToken = jwt.sign({ sub: userId, jti: tokenId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL,
  });

  await prisma.refreshToken.create({
    data: {
      id: tokenId,
      userId,
      tokenHash: await bcrypt.hash(refreshToken, 12),
      expiresAt,
    },
  });

  return { refreshToken, tokenId, expiresAt };
}

async function issueTokensForUser(user: User & { roles: { role: { name: string } }[] }) {
  const { accessToken } = signAccessToken(user);
  const { refreshToken, tokenId, expiresAt } = await signRefreshToken(user.id);

  return {
    user: serializeUser(user),
    accessToken,
    refreshToken,
    refreshTokenId: tokenId,
    refreshTokenExpiresAt: expiresAt,
  };
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  roles: string[];
}) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw createHttpError(409, 'E-mail already registered');
  }

  const roles = await findRolesByName(input.roles);
  if (!roles.length) {
    throw createHttpError(400, 'Invalid roles provided');
  }

  const passwordHash = await bcrypt.hash(input.password, env.PASSWORD_SALT_ROUNDS);

  const user = await createUser({
    name: input.name,
    email: input.email,
    passwordHash,
    roles: {
      create: roles.map((role) => ({ role: { connect: { id: role.id } } })),
    },
  });

  await recordAuditLog({
    userId: user.id,
    action: 'auth.register',
    entity: 'user',
    entityId: user.id,
  });

  return issueTokensForUser(user);
}

export async function authenticateUser(input: { email: string; password: string }) {
  const user = await findUserByEmail(input.email);
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const match = await bcrypt.compare(input.password, user.passwordHash);
  if (!match) {
    throw createHttpError(401, 'Invalid credentials');
  }

  await revokeUserRefreshTokens(user.id);

  await recordAuditLog({
    userId: user.id,
    action: 'auth.login',
    entity: 'user',
    entityId: user.id,
  });

  return issueTokensForUser(user);
}

export async function issueTokensFromRefresh(userId: string) {
  const user = await findUserById(userId);
  if (!user) {
    throw createHttpError(401, 'User not found');
  }

  await revokeUserRefreshTokens(user.id);

  await recordAuditLog({
    userId: user.id,
    action: 'auth.refresh',
    entity: 'user',
    entityId: user.id,
  });

  return issueTokensForUser(user);
}

export async function revokeToken(refreshTokenId: string, userId?: string) {
  await revokeRefreshToken(refreshTokenId);

  if (userId) {
    await recordAuditLog({
      userId,
      action: 'auth.logout',
      entity: 'refresh_token',
      entityId: refreshTokenId,
    });
  }
}
