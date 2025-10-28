import { randomUUID } from 'node:crypto';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: 'admin', description: 'Full platform access' },
    { name: 'trainer', description: 'Manage training plans and clients' },
    { name: 'client', description: 'Access training plans and progress' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: role,
      create: { ...role, id: randomUUID() },
    });
  }

  const adminEmail = 'admin@capifit.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD ?? 'ChangeMe123!';
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'admin' } });

    await prisma.user.create({
      data: {
        id: randomUUID(),
        name: 'Platform Administrator',
        email: adminEmail,
        passwordHash,
        roles: {
          create: {
            roleId: adminRole.id,
          },
        },
      },
    });

    console.log(`✅ Admin user created: ${adminEmail} / ${adminPassword}`);
  }
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
