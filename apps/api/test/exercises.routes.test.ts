import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import createHttpError from 'http-errors';

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

vi.mock('../src/services/exercise-service', () => {
  return {
    listExercises: vi.fn(async () => ({
      data: [],
      pagination: { page: 1, perPage: 25, total: 0, totalPages: 1 },
    })),
    createExercise: vi.fn(async () => ({ id: 'exercise-1' })),
    updateExercise: vi.fn(async () => ({ id: 'exercise-1' })),
    deleteExercise: vi.fn(async () => undefined),
    getExerciseById: vi.fn(async () => ({ id: 'exercise-1' })),
  };
});

const exerciseService = await import('../src/services/exercise-service');

describe('Exercises routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a paginated list of exercises', async () => {
    const response = await request(app).get('/api/v1/exercises');

    expect(response.status).toBe(200);
    expect(exerciseService.listExercises).toHaveBeenCalled();
  });

  it('validates filter enums', async () => {
    const response = await request(app).get('/api/v1/exercises?category=INVALID');

    expect(response.status).toBe(422);
    expect(exerciseService.listExercises).not.toHaveBeenCalled();
  });

  it('creates an exercise when payload is valid', async () => {
    const payload = {
      name: 'Novo exercício',
      category: 'STRENGTH',
      primaryMuscle: 'CHEST',
    };

    const response = await request(app).post('/api/v1/exercises').send(payload);

    expect(response.status).toBe(201);
    expect(exerciseService.createExercise).toHaveBeenCalledWith(expect.anything(), payload);
  });

  it('bubbles validation errors from service', async () => {
    const error = createHttpError(422, 'Validation failed');
    vi.mocked(exerciseService.createExercise).mockRejectedValueOnce(error);

    const response = await request(app)
      .post('/api/v1/exercises')
      .send({ name: 'Invalid' });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('message');
  });

  it('fetches exercise details', async () => {
    const response = await request(app).get('/api/v1/exercises/exercise-1');

    expect(response.status).toBe(200);
    expect(exerciseService.getExerciseById).toHaveBeenCalledWith('exercise-1', true);
  });

  it('updates an exercise', async () => {
    const response = await request(app)
      .patch('/api/v1/exercises/exercise-1')
      .send({ description: 'Atualizado' });

    expect(response.status).toBe(200);
    expect(exerciseService.updateExercise).toHaveBeenCalledWith(
      expect.anything(),
      'exercise-1',
      { description: 'Atualizado' },
    );
  });

  it('deletes an exercise', async () => {
    const response = await request(app).delete('/api/v1/exercises/exercise-1');

    expect(response.status).toBe(204);
    expect(exerciseService.deleteExercise).toHaveBeenCalledWith(expect.anything(), 'exercise-1');
  });
});
