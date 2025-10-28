import { afterEach, afterAll } from 'vitest';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./test.db';
}

import { prisma } from './src/lib/prisma';

afterEach(async () => {
  await prisma.auditTrail.deleteMany();
  await prisma.trainerClientProfile.deleteMany();
  await prisma.client.deleteMany();
  await prisma.trainer.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
