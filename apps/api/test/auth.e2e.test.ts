import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../src/app';

vi.mock('../src/services/auth-service', () => ({
  authenticateUser: vi.fn(async () => ({
    accessToken: 'token',
    refreshToken: 'refresh',
    refreshTokenExpiresAt: new Date(Date.now() + 60_000),
    refreshTokenId: 'refresh-id',
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'user@example.com',
      status: 'ACTIVE',
      roles: ['admin'],
    },
  })),
  registerUser: vi.fn(),
  issueTokensFromRefresh: vi.fn(),
  revokeToken: vi.fn(),
}));

const { authenticateUser } = await import('../src/services/auth-service');

describe('Auth routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects invalid login payloads with 422', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({ email: 'invalid' });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('errors');
    expect(authenticateUser).not.toHaveBeenCalled();
  });

  it('returns 401 when accessing /me without token', async () => {
    const response = await request(app).get('/api/v1/auth/me');

    expect(response.status).toBe(401);
  });

  it('returns 401 when logging out without refresh cookie', async () => {
    const response = await request(app).post('/api/v1/auth/logout');

    expect(response.status).toBe(401);
  });
});
