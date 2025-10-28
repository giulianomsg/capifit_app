import './utils/pg-mem';

import { promises as fs } from 'node:fs';
import path from 'node:path';

import bcrypt from 'bcryptjs';
import request from 'supertest';
import type { Express } from 'express';
import type { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import type { StorageConfig } from '../src/lib/storage';
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  applyMigrations,
  clearDatabase,
  configureTestDatabaseEnv,
  seedBaseData,
} from './utils/database';

const SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS ?? '10');

let app: Express;
let prisma: PrismaClient;
let storage: StorageConfig;
let accessToken: string;
let storagePath: string;

async function authenticateAdmin() {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

  expect(response.status).toBe(200);
  return response.body.token as string;
}

async function createUserFixture(data: { email: string; name: string; roles: string[] }) {
  const roleRecords = await prisma.role.findMany({ where: { name: { in: data.roles } } });

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: await bcrypt.hash('Password123!', SALT_ROUNDS),
      roles: {
        create: roleRecords.map((role) => ({ role: { connect: { id: role.id } } })),
      },
    },
    include: { roles: { include: { role: true } } },
  });
}

describe('Users routes (integration)', () => {
  beforeAll(async () => {
    configureTestDatabaseEnv();

    storagePath = path.resolve(__dirname, '../.tmp/storage');
    process.env.FILE_STORAGE_LOCAL_PATH = storagePath;
    await fs.rm(storagePath, { recursive: true, force: true });

    await applyMigrations();

    ({ prisma } = await import('../src/lib/prisma'));
    ({ storage } = await import('../src/lib/storage'));
    ({ app } = await import('../src/app'));
  });

  beforeEach(async () => {
    await clearDatabase(prisma);
    await seedBaseData(prisma);
    accessToken = await authenticateAdmin();

    await fs.rm(storage.avatarDir, { recursive: true, force: true });
    await fs.mkdir(storage.avatarDir, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(storagePath, { recursive: true, force: true });
    await prisma.$disconnect();
  });

  it('returns the current authenticated user profile', async () => {
    const response = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(ADMIN_EMAIL);
    expect(response.body.user.roles).toContain('admin');
  });

  it('lists users with pagination and filters', async () => {
    await createUserFixture({ email: 'trainer1@test.com', name: 'Trainer One', roles: ['trainer'] });
    await createUserFixture({ email: 'client1@test.com', name: 'Client One', roles: ['client'] });

    const response = await request(app)
      .get('/api/v1/users')
      .query({ roles: 'trainer', search: 'Trainer' })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].email).toBe('trainer1@test.com');
    expect(response.body.pagination.total).toBeGreaterThanOrEqual(1);
  });

  it('creates a user with the requested roles', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'New Trainer',
        email: 'new.trainer@test.com',
        password: 'Password123',
        roles: ['trainer'],
      });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('new.trainer@test.com');

    const created = await prisma.user.findUniqueOrThrow({
      where: { email: 'new.trainer@test.com' },
      include: { roles: { include: { role: true } } },
    });
    expect(created.roles.map((role) => role.role.name)).toContain('trainer');
  });

  it('updates an existing user profile and password', async () => {
    const user = await createUserFixture({
      email: 'update.me@test.com',
      name: 'Update Me',
      roles: ['trainer'],
    });

    const response = await request(app)
      .patch(`/api/v1/users/${user.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated Name',
        password: 'AnotherPass123',
        roles: ['trainer', 'client'],
      });

    expect(response.status).toBe(200);
    expect(response.body.user.name).toBe('Updated Name');
    expect(response.body.user.roles).toEqual(expect.arrayContaining(['trainer', 'client']));

    const updated = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    const samePassword = await bcrypt.compare('AnotherPass123', updated.passwordHash);
    expect(samePassword).toBe(true);
  });

  it('soft deletes a user account', async () => {
    const user = await createUserFixture({
      email: 'remove.me@test.com',
      name: 'Remove Me',
      roles: ['client'],
    });

    const response = await request(app)
      .delete(`/api/v1/users/${user.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(204);

    const deleted = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(deleted.deletedAt).not.toBeNull();
    expect(deleted.status).toBe('INACTIVE');
  });

  it('updates the user avatar and stores the file on disk', async () => {
    const user = await createUserFixture({
      email: 'avatar.user@test.com',
      name: 'Avatar User',
      roles: ['trainer'],
    });

    const fileBuffer = Buffer.from('fake image binary');

    const response = await request(app)
      .patch(`/api/v1/users/${user.id}/avatar`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('avatar', fileBuffer, { filename: 'avatar.png', contentType: 'image/png' });

    expect(response.status).toBe(200);
    expect(response.body.user.avatarUrl).toMatch(/\/uploads\//);

    const updated = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(updated.avatarUrl).not.toBeNull();

    const filePath = path.join(storage.baseDir, updated.avatarUrl!);
    const fileExists = await fs
      .stat(filePath)
      .then(() => true)
      .catch(() => false);
    expect(fileExists).toBe(true);
  });
});
