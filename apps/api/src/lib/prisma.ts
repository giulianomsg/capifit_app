import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['error', 'warn']
});

export type PrismaTransaction = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];
