process.env.DATABASE_URL = 'file:./test.db';

import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

const createTrainerAndClient = async () => {
  const trainer = await prisma.trainer.create({
    data: { name: 'Trainer', email: `trainer-${Date.now()}@example.com` }
  });
  const client = await prisma.client.create({
    data: { name: 'Client', email: `client-${Date.now()}@example.com` }
  });
  return { trainer, client };
};

describe('TrainerClientProfile routes', () => {
  beforeEach(async () => {
    await prisma.auditTrail.deleteMany();
    await prisma.trainerClientProfile.deleteMany();
    await prisma.client.deleteMany();
    await prisma.trainer.deleteMany();
  });

  it('creates a profile and logs audit trail', async () => {
    const { trainer, client } = await createTrainerAndClient();

    const response = await request(app)
      .post('/api/v1/trainer-client-profiles')
      .send({ trainerId: trainer.id, clientId: client.id, goals: 'Lose weight' });

    expect(response.status).toBe(201);
    expect(response.body.trainerId).toBe(trainer.id);

    const auditEntries = await prisma.auditTrail.findMany({
      where: { entity: 'TrainerClientProfile', entityId: response.body.id }
    });
    expect(auditEntries.length).toBeGreaterThan(0);
  });

  it('lists profiles with pagination metadata', async () => {
    const { trainer, client } = await createTrainerAndClient();
    await prisma.trainerClientProfile.create({
      data: {
        trainer: { connect: { id: trainer.id } },
        client: { connect: { id: client.id } },
        goals: 'Gain muscle'
      }
    });

    const response = await request(app).get('/api/v1/trainer-client-profiles?page=1&pageSize=5');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.page).toBe(1);
    expect(response.body.pageSize).toBe(5);
  });
});
