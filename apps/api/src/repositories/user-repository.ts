import type { Prisma } from '@prisma/client';

import { prisma } from '@lib/prisma';

export async function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email, deletedAt: null },
    include: { roles: { include: { role: true } } },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
    include: { roles: { include: { role: true } } },
  });
}

export async function createUser(data: Prisma.UserCreateInput) {
  return prisma.user.create({
    data,
    include: { roles: { include: { role: true } } },
  });
}

export async function findRolesByName(names: string[]) {
  return prisma.role.findMany({
    where: { name: { in: names } },
  });
}

export async function recordAuditLog(params: {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Prisma.JsonValue;
}) {
  await prisma.auditLog.create({
    data: params,
  });
}

export async function revokeRefreshToken(refreshTokenId: string) {
  await prisma.refreshToken.update({
    where: { id: refreshTokenId },
    data: { revokedAt: new Date() },
  });
}

export async function revokeUserRefreshTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
