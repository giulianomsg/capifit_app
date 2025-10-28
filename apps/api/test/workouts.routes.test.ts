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

vi.mock('../src/services/workout-service', () => {
  return {
    listWorkouts: vi.fn(async () => ({
      data: [],
      pagination: { page: 1, perPage: 20, total: 0, totalPages: 1 },
    })),
    createWorkout: vi.fn(async () => ({ id: 'workout-1' })),
    getWorkout: vi.fn(async () => ({ id: 'workout-1' })),
    updateWorkout: vi.fn(async () => ({ id: 'workout-1' })),
    deleteWorkout: vi.fn(async () => undefined),
    registerWorkoutSession: vi.fn(async () => ({ id: 'session-1' })),
    listWorkoutSessions: vi.fn(async () => ([])),
    getWorkoutSummary: vi.fn(async () => ({ cards: [], activities: [], schedule: [], performance: { data: [], dataKey: 'value', title: '', type: 'line' }, role: 'trainer' })),
  };
});

const workoutService = await import('../src/services/workout-service');

describe('Workouts routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates status filter', async () => {
    const response = await request(app).get('/api/v1/workouts?status=UNKNOWN');

    expect(response.status).toBe(422);
    expect(workoutService.listWorkouts).not.toHaveBeenCalled();
  });

  it('validates template filter', async () => {
    const response = await request(app).get('/api/v1/workouts?template=maybe');

    expect(response.status).toBe(422);
    expect(workoutService.listWorkouts).not.toHaveBeenCalled();
  });

  it('lists workouts', async () => {
    const response = await request(app).get('/api/v1/workouts');

    expect(response.status).toBe(200);
    expect(workoutService.listWorkouts).toHaveBeenCalled();
  });

  it('creates a workout and handles validation errors', async () => {
    const error = createHttpError(422, 'Validation failed');
    vi.mocked(workoutService.createWorkout).mockRejectedValueOnce(error);

    const invalidResponse = await request(app).post('/api/v1/workouts').send({ title: 'Invalid' });
    expect(invalidResponse.status).toBe(422);

    vi.mocked(workoutService.createWorkout).mockResolvedValueOnce({ id: 'workout-1' });

    const payload = {
      title: 'Treino força total',
      difficulty: 'INTERMEDIATE',
      status: 'ACTIVE',
      blocks: [
        {
          title: 'Principal',
          order: 0,
          exercises: [
            { exerciseId: 'exercise-1', order: 0, sets: 3, reps: 12 },
          ],
        },
      ],
    };

    const response = await request(app).post('/api/v1/workouts').send(payload);
    expect(response.status).toBe(201);
    expect(workoutService.createWorkout).toHaveBeenLastCalledWith(expect.anything(), payload);
  });

  it('returns workout details', async () => {
    const response = await request(app).get('/api/v1/workouts/workout-1');

    expect(response.status).toBe(200);
    expect(workoutService.getWorkout).toHaveBeenCalledWith(expect.anything(), 'workout-1');
  });

  it('updates a workout', async () => {
    const response = await request(app)
      .patch('/api/v1/workouts/workout-1')
      .send({ title: 'Atualizado' });

    expect(response.status).toBe(200);
    expect(workoutService.updateWorkout).toHaveBeenCalledWith(
      expect.anything(),
      'workout-1',
      { title: 'Atualizado' },
    );
  });

  it('removes a workout', async () => {
    const response = await request(app).delete('/api/v1/workouts/workout-1');

    expect(response.status).toBe(204);
    expect(workoutService.deleteWorkout).toHaveBeenCalledWith(expect.anything(), 'workout-1');
  });

  it('registers and lists sessions', async () => {
    const response = await request(app)
      .post('/api/v1/workouts/workout-1/sessions')
      .send({ durationMinutes: 45 });

    expect(response.status).toBe(201);
    expect(workoutService.registerWorkoutSession).toHaveBeenCalledWith(
      expect.anything(),
      'workout-1',
      { durationMinutes: 45 },
    );

    const listResponse = await request(app).get('/api/v1/workouts/workout-1/sessions');
    expect(listResponse.status).toBe(200);
    expect(workoutService.listWorkoutSessions).toHaveBeenCalledWith(expect.anything(), 'workout-1');
  });

  it('returns workout summary', async () => {
    const response = await request(app).get('/api/v1/workouts/summary');

    expect(response.status).toBe(200);
    expect(workoutService.getWorkoutSummary).toHaveBeenCalled();
  });
});
