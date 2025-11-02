import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import {
  ActivityLevel,
  AssessmentStatus,
  AssessmentType,
  ExerciseCategory,
  MuscleGroup,
  NutritionPlanStatus,
  NotificationCategory,
  NotificationPriority,
  PaymentStatus,
  PrismaClient,
  SubscriptionPlan,
  TrainerClientStatus,
  WorkoutDifficulty,
  WorkoutStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

/** Helpers **/
function withTimeToday(hour: number, minute: number) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function upsertByNameOrCreate<T extends { id: string; name: string }>(
  find: (name: string) => Promise<T | null>,
  create: () => Promise<T>,
  update: (id: string) => Promise<T>
): Promise<T> {
  // Busca por name; se existir, atualiza via id; se não, cria.
  // Útil quando "name" não é UNIQUE no schema.
  const existing = await find((await create).name);
  if (existing) {
    return update(existing.id);
  }
  return create();
}

/** Seeds **/
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
      heightCm: 165,
      weightKg: 68,
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
      heightCm: 178,
      weightKg: 82,
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
      heightCm: 160,
      weightKg: 72,
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
        heightCm: seed.heightCm,
        weightKg: seed.weightKg,
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
        heightCm: seed.heightCm,
        weightKg: seed.weightKg,
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

async function seedAssessmentTemplates(trainerId: string) {
  const templates = [
    {
      name: 'Avaliação Inicial Completa',
      description: 'Checklist completo com composição corporal e mobilidade.',
      type: AssessmentType.COMPLETE,
      isDefault: true,
      metrics: {
        measurements: ['weight', 'bodyFat', 'muscleMass', 'waist', 'hip'],
        tests: ['flexibility', 'vo2max', 'pushups'],
      },
    },
    {
      name: 'Reavaliação Mensal',
      description: 'Acompanhamento mensal com foco em progresso geral.',
      type: AssessmentType.FOLLOW_UP,
      isDefault: true,
      metrics: {
        measurements: ['weight', 'bodyFat', 'chest', 'thigh'],
        tests: ['plank', 'squat'],
      },
    },
    {
      name: 'Bioimpedância Corporal',
      description: 'Protocolo para aferição de bioimpedância segmentar.',
      type: AssessmentType.BIOIMPEDANCE,
      isDefault: false,
      metrics: {
        measurements: ['weight', 'bodyFat', 'visceralFat'],
      },
    },
  ];

  for (const t of templates) {
    const existing = await prisma.assessmentTemplate.findFirst({ where: { name: t.name } });
    if (existing) {
      await prisma.assessmentTemplate.update({
        where: { id: existing.id },
        data: {
          description: t.description,
          type: t.type,
          metrics: t.metrics,
          isDefault: t.isDefault,
          trainerId: t.isDefault ? null : trainerId,
        },
      });
    } else {
      await prisma.assessmentTemplate.create({
        data: {
          id: randomUUID(),
          name: t.name,
          description: t.description,
          type: t.type,
          metrics: t.metrics,
          isDefault: t.isDefault,
          trainerId: t.isDefault ? null : trainerId,
        },
      });
    }
  }
}

async function seedAssessments(trainerId: string, clientIds: string[]) {
  if (!clientIds.length) return;

  const defaultTemplate = await prisma.assessmentTemplate.findFirst({ where: { isDefault: true } });
  const [firstClient, secondClient] = clientIds;

  if (firstClient) {
    const existing = await prisma.assessment.findFirst({
      where: {
        trainerId,
        clientId: firstClient,
        status: AssessmentStatus.COMPLETED,
      },
    });

    if (!existing) {
      const assessment = await prisma.assessment.create({
        data: {
          id: randomUUID(),
          trainerId,
          clientId: firstClient,
          templateId: defaultTemplate?.id ?? null,
          status: AssessmentStatus.COMPLETED,
          type: AssessmentType.COMPLETE,
          scheduledFor: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          performedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          notes: 'Cliente demonstrou excelente evolução e melhora na postura.',
          metrics: {
            weightKg: 66,
            bodyFat: 22,
            muscleMass: 28,
            flexibility: 'Boa',
          },
        },
      });

      await prisma.measurementRecord.create({
        data: {
          id: randomUUID(),
          trainerId,
          clientId: firstClient,
          assessmentId: assessment.id,
          recordedAt: assessment.performedAt ?? new Date(),
          weightKg: 66,
          heightCm: 165,
          bodyFat: 22,
          muscleMass: 28,
          waist: 72,
          hip: 98,
          notes: 'Mantém boa adesão ao plano alimentar.',
          data: { bmi: 24.2 },
        },
      });
    }
  }

  if (secondClient) {
    const scheduled = await prisma.assessment.findFirst({
      where: {
        trainerId,
        clientId: secondClient,
        status: AssessmentStatus.SCHEDULED,
      },
    });

    if (!scheduled) {
      await prisma.assessment.create({
        data: {
          id: randomUUID(),
          trainerId,
          clientId: secondClient,
          templateId: defaultTemplate?.id ?? null,
          status: AssessmentStatus.SCHEDULED,
          type: AssessmentType.FOLLOW_UP,
          scheduledFor: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          notes: 'Revisar mobilidade e carga de treino.',
        },
      });
    }
  }
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
  if (clientIds.length === 0) return;

  const clientId = clientIds[0];
  const exercises = await prisma.exercise.findMany({ where: { deletedAt: null } });
  if (exercises.length < 3) return;

  const existing = await prisma.workout.findFirst({
    where: { trainerId, clientId, title: 'Treino força total', deletedAt: null },
  });
  if (existing) return;

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

async function seedFoodDatabase(trainerId: string) {
  const foods = [
    { name: 'Arroz branco cozido', slug: 'arroz-branco-cozido', category: 'cereais', servingSize: 100, calories: 128, protein: 2.6, carbs: 26.2, fat: 0.2, fiber: 0.4, origin: 'taco' },
    { name: 'Feijão preto cozido', slug: 'feijao-preto-cozido', category: 'leguminosas', servingSize: 100, calories: 77, protein: 4.5, carbs: 14.0, fat: 0.5, fiber: 8.4, origin: 'taco' },
    { name: 'Peito de frango grelhado', slug: 'peito-frango-grelhado', category: 'carnes', servingSize: 100, calories: 165, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0, origin: 'taco' },
    { name: 'Banana nanica', slug: 'banana-nanica', category: 'frutas', servingSize: 100, calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, origin: 'taco' },
    { name: 'Brócolis cozido', slug: 'brocolis-cozido', category: 'vegetais', servingSize: 100, calories: 55, protein: 3.7, carbs: 11.1, fat: 0.6, fiber: 3.8, origin: 'taco' },
  ];

  for (const food of foods) {
    await prisma.food.upsert({
      where: { slug: food.slug },
      update: {
        ...food,
        createdById: trainerId,
      },
      create: {
        id: randomUUID(),
        ...food,
        createdById: trainerId,
      },
    });
  }
}

async function seedNutritionPlans(trainerId: string, clientIds: string[]) {
  if (!clientIds.length) return;

  const foods = await prisma.food.findMany({ take: 5, orderBy: { name: 'asc' } });
  if (!foods.length) return;

  const clientId = clientIds[0];
  const existing = await prisma.nutritionPlan.findFirst({
    where: { trainerId, clientId, status: NutritionPlanStatus.ACTIVE },
  });
  if (existing) return;

  const plan = await prisma.nutritionPlan.create({
    data: {
      id: randomUUID(),
      trainerId,
      clientId,
      title: 'Plano Alimentar - Hipertrofia',
      description: 'Plano equilibrado com foco em ganho de massa magra e recuperação.',
      status: NutritionPlanStatus.ACTIVE,
      caloriesGoal: 2400,
      macros: { protein: 180, carbs: 260, fat: 70 },
      startDate: new Date(),
      meals: {
        create: [
          {
            id: randomUUID(),
            name: 'Café da manhã',
            order: 0,
            scheduledAt: withTimeToday(7, 0),
            notes: 'Adicionar fonte de vitamina C',
            items: {
              create: [
                {
                  id: randomUUID(),
                  foodId: foods[3]?.id!,
                  quantity: 120,
                  unit: 'g',
                  macros: {
                    calories: (foods[3]?.calories ?? 0) * 1.2,
                    protein: (foods[3]?.protein ?? 0) * 1.2,
                    carbs: (foods[3]?.carbs ?? 0) * 1.2,
                    fat: (foods[3]?.fat ?? 0) * 1.2,
                  },
                },
                {
                  id: randomUUID(),
                  foodId: foods[2]?.id!,
                  quantity: 120,
                  unit: 'g',
                  macros: {
                    calories: (foods[2]?.calories ?? 0) * 1.2,
                    protein: (foods[2]?.protein ?? 0) * 1.2,
                    carbs: (foods[2]?.carbs ?? 0) * 1.2,
                    fat: (foods[2]?.fat ?? 0) * 1.2,
                  },
                },
              ],
            },
          },
          {
            id: randomUUID(),
            name: 'Almoço',
            order: 1,
            scheduledAt: withTimeToday(13, 0),
            notes: 'Adicionar salada verde',
            items: {
              create: [
                {
                  id: randomUUID(),
                  foodId: foods[0]?.id!,
                  quantity: 150,
                  unit: 'g',
                  macros: {
                    calories: (foods[0]?.calories ?? 0) * 1.5,
                    protein: (foods[0]?.protein ?? 0) * 1.5,
                    carbs: (foods[0]?.carbs ?? 0) * 1.5,
                    fat: (foods[0]?.fat ?? 0) * 1.5,
                  },
                },
                {
                  id: randomUUID(),
                  foodId: foods[1]?.id!,
                  quantity: 100,
                  unit: 'g',
                  macros: {
                    calories: foods[1]?.calories ?? 0,
                    protein: foods[1]?.protein ?? 0,
                    carbs: foods[1]?.carbs ?? 0,
                    fat: foods[1]?.fat ?? 0,
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Nutrition plan created for client ${clientId}: ${plan.title}`);
}

async function seedNotificationPreferences(userIds: string[]) {
  for (const userId of userIds) {
    await prisma.notificationPreference.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        categories: Object.values(NotificationCategory),
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
      },
    });
  }
}

async function seedNotifications(trainerId: string, clientIds: string[]) {
  const trainer = await prisma.user.findUnique({ where: { id: trainerId } });
  if (!trainer) return;

  for (const clientId of clientIds) {
    const client = await prisma.user.findUnique({ where: { id: clientId } });
    if (!client) continue;

    await prisma.notification.createMany({
      data: [
        {
          id: randomUUID(),
          userId: trainerId,
          category: NotificationCategory.WORKOUT,
          priority: NotificationPriority.NORMAL,
          title: `Treino atualizado para ${client.name}`,
          message: 'Novo treino disponível no painel do cliente.',
        },
        {
          id: randomUUID(),
          userId: clientId,
          category: NotificationCategory.MESSAGE,
          priority: NotificationPriority.HIGH,
          title: 'Bem-vindo(a) ao acompanhamento!',
          message: 'Converse com seu treinador para alinhar objetivos da semana.',
        },
      ],
      skipDuplicates: true,
    });
  }
}

async function seedMessaging(trainerId: string, clientIds: string[]) {
  const [firstClient] = clientIds;
  if (!firstClient) return;

  const existingThread = await prisma.messageThread.findFirst({
    where: {
      participants: {
        every: {
          userId: { in: [trainerId, firstClient] },
        },
      },
    },
  });

  if (existingThread) return;

  const threadId = randomUUID();
  const now = new Date();

  await prisma.messageThread.create({
    data: {
      id: threadId,
      title: 'Plano semanal',
      createdById: trainerId,
      lastMessageAt: now,
      participants: {
        createMany: {
          data: [
            {
              id: randomUUID(),
              userId: trainerId,
              role: 'owner',
              joinedAt: now,
              lastReadAt: now,
            },
            {
              id: randomUUID(),
              userId: firstClient,
              role: 'member',
              joinedAt: now,
            },
          ],
        },
      },
      messages: {
        create: [
          {
            id: randomUUID(),
            senderId: trainerId,
            content: 'Olá! Confira o plano de treinos atualizado para esta semana. Qualquer dúvida me avise por aqui.',
          },
          {
            id: randomUUID(),
            senderId: firstClient,
            content: 'Recebido! Vou revisar e retorno se surgir alguma dúvida. Obrigado!',
            createdAt: new Date(now.getTime() + 5 * 60 * 1000),
          },
        ],
      },
    },
  });
}

async function main() {
  await ensureRoles();
  await ensureAdmin();
  const { trainer, trainerClients } = await ensureTrainerWithClients();
  await seedAssessmentTemplates(trainer.id);
  await seedAssessments(trainer.id, trainerClients);
  await seedExercises(trainer.id);
  await seedWorkouts(trainer.id, trainerClients);
  await seedFoodDatabase(trainer.id);
  await seedNutritionPlans(trainer.id, trainerClients);
  await seedNotificationPreferences([trainer.id, ...trainerClients]);
  await seedNotifications(trainer.id, trainerClients);
  await seedMessaging(trainer.id, trainerClients);
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
