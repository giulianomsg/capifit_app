import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../src/app';

vi.mock('../src/middlewares/auth', () => {
  return {
    requireAuth: (req: any, _res: any, next: any) => {
      req.user = {
        id: 'trainer-1',
        email: 'trainer@example.com',
        name: 'Trainer User',
        status: 'ACTIVE',
        roles: ['trainer'],
      };
      next();
    },
    requireRoles: () => (_req: any, _res: any, next: any) => next(),
    authenticateRefreshToken: vi.fn(),
  };
});

vi.mock('../src/services/client-service', () => {
  return {
    listClients: vi.fn(async () => ({
      data: [],
      pagination: { page: 1, perPage: 25, total: 0, totalPages: 1 },
      metrics: {
        totalClients: 0,
        activeClients: 0,
        pausedClients: 0,
        endedClients: 0,
        newThisMonth: 0,
        paymentStatus: { ON_TIME: 0, PENDING: 0, LATE: 0 },
        subscriptionDistribution: { MONTHLY: 0, QUARTERLY: 0, ANNUAL: 0, CUSTOM: 0 },
        activityLevels: { HIGH: 0, MEDIUM: 0, LOW: 0, INACTIVE: 0 },
        averageProgress: 0,
      },
    })),
    createClientAssignment: vi.fn(async () => ({ id: 'assignment-1' })),
    updateClientAssignment: vi.fn(async () => ({ id: 'assignment-1' })),
    removeClientAssignment: vi.fn(async () => undefined),
  };
});

const clientService = await import('../src/services/client-service');

describe('Clients routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a paginated list of clients', async () => {
    const response = await request(app).get('/api/v1/clients');

    expect(response.status).toBe(200);
    expect(clientService.listClients).toHaveBeenCalled();
    expect(response.body).toHaveProperty('data');
  });

  it('validates creation payload', async () => {
    const response = await request(app).post('/api/v1/clients').send({ name: 'Invalid' });

    expect(response.status).toBe(422);
    expect(clientService.createClientAssignment).not.toHaveBeenCalled();
  });

  it('creates a client assignment', async () => {
    const response = await request(app)
      .post('/api/v1/clients')
      .send({
        name: 'Maria Silva',
        email: 'maria@example.com',
        subscriptionPlan: 'MONTHLY',
        paymentStatus: 'ON_TIME',
        activityLevel: 'HIGH',
      });

    expect(response.status).toBe(201);
    expect(clientService.createClientAssignment).toHaveBeenCalled();
  });

  it('validates updates before applying', async () => {
    const response = await request(app).patch('/api/v1/clients/assignment-1').send({ status: 'UNKNOWN' });

    expect(response.status).toBe(422);
    expect(clientService.updateClientAssignment).not.toHaveBeenCalled();
  });

  it('updates an assignment when payload is valid', async () => {
    const response = await request(app)
      .patch('/api/v1/clients/assignment-1')
      .send({ status: 'PAUSED' });

    expect(response.status).toBe(200);
    expect(clientService.updateClientAssignment).toHaveBeenCalledWith(
      expect.objectContaining({ assignmentId: 'assignment-1' }),
    );
  });

  it('removes a client assignment', async () => {
    const response = await request(app).delete('/api/v1/clients/assignment-1');

    expect(response.status).toBe(204);
    expect(clientService.removeClientAssignment).toHaveBeenCalledWith(
      expect.objectContaining({ assignmentId: 'assignment-1' }),
    );
  });
});
