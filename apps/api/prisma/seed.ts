import { randomUUID } from 'node:crypto';

import {
  ActivityLevel,
  ExerciseCategory,
  MuscleGroup,
  PaymentStatus,
  PrismaClient,
  SubscriptionPlan,
  TrainerClientStatus,
  WorkoutDifficulty,
  WorkoutStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function ensureRoles() {
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
}

async function ensureAdmin() {
  const adminEmail = 'admin@capifit.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existingAdmin) {
    return existingAdmin;
  }

  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD ?? 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'admin' } });

  const admin = await prisma.user.create({
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
  return admin;
}

async function ensureTrainerWithClients() {
  const trainerEmail = 'trainer@capifit.com';
  const trainerRole = await prisma.role.findUniqueOrThrow({ where: { name: 'trainer' } });
  const clientRole = await prisma.role.findUniqueOrThrow({ where: { name: 'client' } });

  const trainerPassword = process.env.TRAINER_DEFAULT_PASSWORD ?? 'Trainer123!';
  const trainerHash = await bcrypt.hash(trainerPassword, 12);

  const trainer = await prisma.user.upsert({
    where: { email: trainerEmail },
    update: {
      name: 'Coach Expert',
      phone: '+55 11 99999-1234',
    },
    create: {
      id: randomUUID(),
      name: 'Coach Expert',
      email: trainerEmail,
      passwordHash: trainerHash,
      roles: {
        create: {
          roleId: trainerRole.id,
        },
      },
    },
    include: { roles: true },
  });

  console.log(`✅ Trainer user available: ${trainerEmail} / ${trainerPassword}`);

  const clientsSeed = [
    {
      name: 'Maria Santos Silva',
      email: 'maria.santos@email.com',
      phone: '+55 11 99999-1234',
      subscriptionPlan: SubscriptionPlan.MONTHLY,
      paymentStatus: PaymentStatus.ON_TIME,
      progressPercentage: 85,
      activityLevel: ActivityLevel.HIGH,
      lastWorkoutAt: new Date(),
      nextAssessmentAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      goals: ['Perda de peso', 'Condicionamento'],
    },
    {
      name: 'Carlos Eduardo Oliveira',
      email: 'carlos.oliveira@email.com',
      phone: '+55 11 98888-5678',
      subscriptionPlan: SubscriptionPlan.QUARTERLY,
      paymentStatus: PaymentStatus.ON_TIME,
      progressPercentage: 92,
      activityLevel: ActivityLevel.HIGH,
      lastWorkoutAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      nextAssessmentAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      goals: ['Ganho de massa muscular'],
    },
    {
      name: 'Ana Paula Costa',
      email: 'ana.costa@email.com',
      phone: '+55 11 97777-9012',
      subscriptionPlan: SubscriptionPlan.ANNUAL,
      paymentStatus: PaymentStatus.PENDING,
      progressPercentage: 67,
      activityLevel: ActivityLevel.MEDIUM,
      lastWorkoutAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      nextAssessmentAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      goals: ['Reabilitação'],
    },
  ];

  const trainerClients: string[] = [];

  for (const seed of clientsSeed) {
    const clientPassword = await bcrypt.hash('Client123!', 12);

    const client = await prisma.user.upsert({
      where: { email: seed.email },
      update: {
        name: seed.name,
        phone: seed.phone,
      },
      create: {
        id: randomUUID(),
        name: seed.name,
        email: seed.email,
        phone: seed.phone,
        passwordHash: clientPassword,
        status: 'ACTIVE',
        roles: {
          create: {
            roleId: clientRole.id,
          },
        },
      },
    });

    trainerClients.push(client.id);

    await prisma.clientProfile.upsert({
      where: { userId: client.id },
      update: {
        subscriptionPlan: seed.subscriptionPlan,
        paymentStatus: seed.paymentStatus,
        progressPercentage: seed.progressPercentage,
        activityLevel: seed.activityLevel,
        lastWorkoutAt: seed.lastWorkoutAt,
        nextAssessmentAt: seed.nextAssessmentAt,
        goals: seed.goals,
      },
      create: {
        id: randomUUID(),
        userId: client.id,
        subscriptionPlan: seed.subscriptionPlan,
        paymentStatus: seed.paymentStatus,
        progressPercentage: seed.progressPercentage,
        activityLevel: seed.activityLevel,
        lastWorkoutAt: seed.lastWorkoutAt,
        nextAssessmentAt: seed.nextAssessmentAt,
        goals: seed.goals,
      },
    });

    await prisma.trainerClient.upsert({
      where: {
        trainerId_clientId: {
          trainerId: trainer.id,
          clientId: client.id,
        },
      },
      update: {
        status: TrainerClientStatus.ACTIVE,
        endedAt: null,
      },
      create: {
        id: randomUUID(),
        trainerId: trainer.id,
        clientId: client.id,
        status: TrainerClientStatus.ACTIVE,
      },
    });
  }

  return { trainer, trainerClients };
}

async function seedExercises(trainerId: string) {
  const exercises = [
    {
      name: 'Supino reto com barra',
      slug: 'supino-reto-barra',
      description: 'Exercício clássico focado no peitoral maior com suporte de tríceps e deltoides.',
      instructions: 'Deite no banco, segure a barra com pegada um pouco maior que a largura dos ombros, desça até o peito e empurre.',
      category: ExerciseCategory.STRENGTH,
      primaryMuscle: MuscleGroup.CHEST,
      difficulty: WorkoutDifficulty.INTERMEDIATE,
      videoUrl: 'https://videos.capifit.com/supino-reto.mp4',
      imageUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5',
      caloriesPerSet: 8,
    },
    {
      name: 'Agachamento livre',
      slug: 'agachamento-livre',
      description: 'Movimento composto para fortalecimento de quadríceps, glúteos e core.',
      instructions: 'Posicione a barra sobre o trapézio, desça com quadril para trás e joelhos alinhados aos pés.',
      category: ExerciseCategory.STRENGTH,
      primaryMuscle: MuscleGroup.LEGS,
      difficulty: WorkoutDifficulty.INTERMEDIATE,
      videoUrl: 'https://videos.capifit.com/agachamento.mp4',
      imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61',
      caloriesPerSet: 10,
    },
    {
      name: 'Remada curvada',
      slug: 'remada-curvada',
      description: 'Fortalece as costas, trabalhando latíssimos e romboides.',
      instructions: 'Incline o tronco mantendo a lombar neutra, puxe a barra em direção ao abdômen.',
      category: ExerciseCategory.STRENGTH,
      primaryMuscle: MuscleGroup.BACK,
      difficulty: WorkoutDifficulty.INTERMEDIATE,
      videoUrl: 'https://videos.capifit.com/remada.mp4',
      imageUrl: 'https://images.unsplash.com/photo-1574689049868-0f84f3d8f8c0',
      caloriesPerSet: 7,
    },
    {
      name: 'Prancha abdominal',
      slug: 'prancha-abdominal',
      description: 'Isometria para fortalecimento do core e estabilidade postural.',
      instructions: 'Apoie antebraços e ponta dos pés no chão, mantenha o corpo alinhado e abdômen contraído.',
      category: ExerciseCategory.MOBILITY,
      primaryMuscle: MuscleGroup.CORE,
      difficulty: WorkoutDifficulty.BEGINNER,
      videoUrl: 'https://videos.capifit.com/prancha.mp4',
      imageUrl: 'https://images.unsplash.com/photo-1514996937319-344454492b37',
      caloriesPerSet: 4,
    },
    {
      name: 'Corrida na esteira',
      slug: 'corrida-esteira',
      description: 'Exercício cardiovascular para melhora do condicionamento.',
      instructions: 'Ajuste a velocidade gradualmente e mantenha postura ereta durante a corrida.',
      category: ExerciseCategory.CARDIO,
      primaryMuscle: MuscleGroup.FULL_BODY,
      difficulty: WorkoutDifficulty.INTERMEDIATE,
      videoUrl: 'https://videos.capifit.com/corrida.mp4',
      imageUrl: 'https://images.unsplash.com/photo-1546484959-f759882289bb',
      caloriesPerSet: 12,
    },
  ];

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { slug: exercise.slug },
      update: {
        ...exercise,
        createdById: trainerId,
        deletedAt: null,
        isPublic: true,
      },
      create: {
        id: randomUUID(),
        ...exercise,
        createdById: trainerId,
      },
    });
  }
}

async function seedWorkouts(trainerId: string, clientIds: string[]) {
  if (clientIds.length === 0) {
    return;
  }

  const clientId = clientIds[0];
  const exercises = await prisma.exercise.findMany({ where: { deletedAt: null } });

  if (exercises.length < 3) {
    return;
  }

  const existing = await prisma.workout.findFirst({
    where: { trainerId, clientId, title: 'Treino força total', deletedAt: null },
  });

  if (existing) {
    return;
  }

  const [supino, agachamento, prancha] = exercises;

  const workout = await prisma.workout.create({
    data: {
      id: randomUUID(),
      trainerId,
      clientId,
      title: 'Treino força total',
      description: 'Sessão focada em força geral para membros superiores e core.',
      difficulty: WorkoutDifficulty.INTERMEDIATE,
      status: WorkoutStatus.ACTIVE,
      startDate: new Date(),
      estimatedDuration: 60,
      estimatedCalories: 450,
      schedule: ['segunda', 'quinta'],
      blocks: {
        create: [
          {
            id: randomUUID(),
            title: 'Força superior',
            order: 0,
            exercises: {
              create: [
                {
                  id: randomUUID(),
                  exerciseId: supino.id,
                  order: 0,
                  sets: 4,
                  reps: 10,
                  restSeconds: 90,
                },
              ],
            },
          },
          {
            id: randomUUID(),
            title: 'Core e estabilidade',
            order: 1,
            exercises: {
              create: [
                {
                  id: randomUUID(),
                  exerciseId: prancha.id,
                  order: 0,
                  sets: 3,
                  reps: 1,
                  estimatedTempo: 60,
                  restSeconds: 45,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.sessionLog.create({
    data: {
      id: randomUUID(),
      workoutId: workout.id,
      clientId,
      performedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      durationMinutes: 58,
      perceivedEffort: 8,
      notes: 'Cliente executou todas as séries com técnica consistente.',
    },
  });
}

async function main() {
  await ensureRoles();
  await ensureAdmin();
  const { trainer, trainerClients } = await ensureTrainerWithClients();
  await seedExercises(trainer.id);
  await seedWorkouts(trainer.id, trainerClients);
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
