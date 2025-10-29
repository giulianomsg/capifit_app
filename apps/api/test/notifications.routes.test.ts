import './utils/pg-mem';

import request from 'supertest';
import bcrypt from 'bcryptjs';
import type { Express } from 'express';
import type { PrismaClient } from '@prisma/client';
import { NotificationCategory } from '@prisma/client';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  applyMigrations,
  clearDatabase,
  configureTestDatabaseEnv,
  seedBaseData,
} from './utils/database';

let app: Express;
let prisma: PrismaClient;
let accessToken: string;

async function authenticateAdmin() {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

  expect(response.status).toBe(200);
  return response.body.token as string;
}

describe('Notifications routes', () => {
  beforeAll(async () => {
    configureTestDatabaseEnv();
    await applyMigrations();

    ({ prisma } = await import('../src/lib/prisma'));
    ({ app } = await import('../src/app'));
  });

  beforeEach(async () => {
    await clearDatabase(prisma);
    const admin = await seedBaseData(prisma);
    accessToken = await authenticateAdmin();

    await prisma.notificationPreference.create({
      data: {
        userId: admin.id,
        categories: Object.values(NotificationCategory),
        emailEnabled: true,
        pushEnabled: true,
      },
    });

    await prisma.notification.create({
      data: {
        userId: admin.id,
        category: NotificationCategory.SYSTEM,
        title: 'Nova atualização',
        message: 'Seu painel recebeu novas métricas.',
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('lists notifications for the authenticated user', async () => {
    const response = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta.total).toBe(1);
    expect(response.body.data[0].title).toBe('Nova atualização');
  });

  it('marks notifications as read', async () => {
    const notifications = await prisma.notification.findMany();
    const response = await request(app)
      .post('/api/v1/notifications/mark-read')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ids: notifications.map((notification) => notification.id) });

    expect(response.status).toBe(200);
    expect(response.body.count).toBeGreaterThan(0);

    const updated = await prisma.notification.findMany();
    expect(updated.every((notification) => notification.readAt !== null)).toBe(true);
  });

  it('updates notification preferences', async () => {
    const response = await request(app)
      .put('/api/v1/notifications/preferences')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        emailEnabled: false,
        categories: [NotificationCategory.WORKOUT, NotificationCategory.MESSAGE],
      });

    expect(response.status).toBe(200);
    expect(response.body.emailEnabled).toBe(false);
    expect(response.body.categories).toEqual([
      NotificationCategory.WORKOUT,
      NotificationCategory.MESSAGE,
    ]);
  });

  it('exposes notification queue health to administrators', async () => {
    const response = await request(app)
      .get('/api/v1/notifications/health')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      queueName: 'notifications:email',
      isEnabled: expect.any(Boolean),
      status: expect.any(String),
    });
    expect(response.body.jobCounts).toBeDefined();
  });

  it('prevents non-admin users from accessing notification queue health', async () => {
    const password = 'Trainer123!';
    const passwordHash = await bcrypt.hash(password, 10);

    const trainer = await prisma.user.create({
      data: {
        name: 'Trainer Notifications',
        email: 'trainer.notifications@capifit.test',
        passwordHash,
        roles: {
          create: [
            {
              role: {
                connect: { name: 'trainer' },
              },
            },
          ],
        },
      },
    });

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: trainer.email, password });

    expect(loginResponse.status).toBe(200);

    const trainerToken = loginResponse.body.token as string;

    const response = await request(app)
      .get('/api/v1/notifications/health')
      .set('Authorization', `Bearer ${trainerToken}`);

    expect(response.status).toBe(403);
  });
});
