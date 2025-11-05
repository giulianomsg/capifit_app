import '../utils/pg-mem';
import { configureTestDatabaseEnv, applyMigrations } from '../utils/database';
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __TEST_PRISMA__: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

async function ensureMigrationsOnce(client: PrismaClient) {
  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "__test_migrations_run" (id INT PRIMARY KEY);
  `);
  const already = await client.$queryRawUnsafe<{ count: number }[]>(
    `SELECT COUNT(*)::int as count FROM "__test_migrations_run";`
  );
  if (already[0]?.count === 0) {
    // Se seus testes usam pg-mem: garanta que o DDL rode apenas uma vez aqui.
    // Se usam DB real de teste, mantenha assim e confie nas migrations aplicadas.
    await client.$executeRawUnsafe(`INSERT INTO "__test_migrations_run"(id) VALUES (1);`);
  }
}

configureTestDatabaseEnv();

if (!global.__TEST_PRISMA__) {
  global.__TEST_PRISMA__ = new PrismaClient();
}

export const prisma = global.__TEST_PRISMA__;
global.prisma = prisma;

void (async () => {
  try {
    await applyMigrations();
    await ensureMigrationsOnce(prisma!);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize test database', error);
  }
})();
