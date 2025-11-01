import './utils/pg-mem';

import request from 'supertest';
import bcrypt from 'bcryptjs';
import type { Express } from 'express';
import type { PrismaClient } from '@prisma/client';
import { NotificationCategory, NotificationPriority } from '@prisma/client';
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

async function seedNotifications(userId: string, count: number) {
  const notifications = [] as { id: string }[];
  for (let index = 0; index < count; index += 1) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        category: index % 2 === 0 ? NotificationCategory.SYSTEM : NotificationCategory.WORKOUT,
        priority: index % 3 === 0 ? NotificationPriority.HIGH : NotificationPriority.NORMAL,
        title: `Notificação ${index + 1}`,
        message: `Conteúdo dinâmico ${index + 1}`,
        createdAt: new Date(Date.now() - index * 60000),
      },
      select: { id: true },
    });

    if (index % 4 === 0) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: { readAt: new Date() },
      });
    }

    notifications.push(notification);
  }

  return notifications;
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

  it('supports pagination, search and category filtering', async () => {
    const admin = await prisma.user.findUniqueOrThrow({ where: { email: ADMIN_EMAIL } });
    await seedNotifications(admin.id, 12);

    const pageTwoResponse = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page: 2, perPage: 5 });

    expect(pageTwoResponse.status).toBe(200);
    expect(pageTwoResponse.body.meta).toMatchObject({
      page: 2,
      perPage: 5,
      total: 13,
      totalPages: 3,
    });
    expect(pageTwoResponse.body.data).toHaveLength(5);
    expect(pageTwoResponse.body.data[0].title).toContain('Notificação');

    const searchResponse = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ search: 'dinâmico 3' });

    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body.meta.total).toBe(1);
    expect(searchResponse.body.data[0].message).toContain('dinâmico 3');

    const categoryResponse = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ category: NotificationCategory.WORKOUT });

    expect(categoryResponse.status).toBe(200);
    expect(categoryResponse.body.data.every((item: any) => item.category === NotificationCategory.WORKOUT)).toBe(true);
  });

  it('filters unread notifications when requested', async () => {
    const admin = await prisma.user.findUniqueOrThrow({ where: { email: ADMIN_EMAIL } });
    await seedNotifications(admin.id, 6);

    const unreadResponse = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ unreadOnly: 'true' });

    expect(unreadResponse.status).toBe(200);
    expect(unreadResponse.body.meta.total).toBeGreaterThan(0);
    expect(unreadResponse.body.data.every((item: any) => item.readAt === null)).toBe(true);
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
