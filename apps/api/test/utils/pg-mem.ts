import { newDb } from 'pg-mem';
import { vi } from 'vitest';

export const memDatabase = newDb({
  autoCreateForeignKeyIndices: true,
  noAstCoverageCheck: true,
});

const DATABASE_NAME = 'capifit_test';

memDatabase.public.registerFunction({
  name: 'current_database',
  returns: 'text',
  implementation: () => DATABASE_NAME,
});

const adapter = memDatabase.adapters.createPg();

vi.mock('pg', () => {
  return {
    ...adapter,
    default: {
      ...adapter,
      Pool: adapter.Pool,
      Client: adapter.Client,
    },
    Pool: adapter.Pool,
    Client: adapter.Client,
  };
});

export const connectionString = `postgresql://test:${DATABASE_NAME}@localhost:5432/${DATABASE_NAME}`;
