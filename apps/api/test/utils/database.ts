import { promises as fs } from 'node:fs';
import path from 'node:path';

import bcrypt from 'bcryptjs';
import type { PrismaClient } from '@prisma/client';

import { connectionString, memDatabase } from './pg-mem';

const SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS ?? '10');

export async function applyMigrations() {
  const migrationsDir = path.resolve(__dirname, '../../prisma/migrations');
  const entries = await fs.readdir(migrationsDir, { withFileTypes: true });
  const directories = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const directory of directories) {
    const filePath = path.join(migrationsDir, directory, 'migration.sql');
    const rawSql = await fs.readFile(filePath, 'utf-8');
    const sanitized = rawSql
      .replace(/CREATE OR REPLACE FUNCTION[\s\S]+?LANGUAGE plpgsql;\s*/gi, '')
      .replace(/CREATE TRIGGER[\s\S]+?EXECUTE FUNCTION[\s\S]+?;\s*/gi, '');
    if (sanitized.trim().length === 0) {
      continue;
    }
    memDatabase.public.none(sanitized);
  }
}

export async function clearDatabase(prisma: PrismaClient) {
  await prisma.messageReceipt.deleteMany();
  await prisma.message.deleteMany();
  await prisma.threadParticipant.deleteMany();
  await prisma.messageThread.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.sessionLog.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.workoutBlock.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.trainerClient.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
}

export const ADMIN_EMAIL = 'admin.integration@capifit.test';
export const ADMIN_PASSWORD = 'Admin123!';

export async function seedBaseData(prisma: PrismaClient) {
  const roleNames = [
    { name: 'admin', description: 'Full access' },
    { name: 'trainer', description: 'Trainer permissions' },
    { name: 'client', description: 'Client permissions' },
  ];

  for (const role of roleNames) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash: adminPasswordHash },
    create: {
      name: 'Integration Admin',
      email: ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      roles: {
        create: [
          {
            role: {
              connect: { name: 'admin' },
            },
          },
        ],
      },
    },
    include: { roles: { include: { role: true } } },
  });

  return admin;
}

export function configureTestDatabaseEnv() {
  process.env.DATABASE_URL = connectionString;
  process.env.SHADOW_DATABASE_URL = connectionString;
}
