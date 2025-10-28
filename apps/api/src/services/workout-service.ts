import { randomUUID } from 'node:crypto';

import createHttpError from 'http-errors';
import { z } from 'zod';
import {
  Prisma,
  TrainerClientStatus,
  WorkoutDifficulty,
  WorkoutStatus,
} from '@prisma/client';

import { prisma } from '../lib/prisma';
import { recordAuditLog } from '../repositories/user-repository';

interface AuthenticatedUser {
  id: string;
  roles: string[];
  email: string;
  name: string;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

const isoDate = z.preprocess((value) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed;
}, z.date());

const workoutExerciseSchema = z.object({
  exerciseId: z.string().cuid(),
  order: z.coerce.number().int().min(0),
  sets: z.coerce.number().int().min(1).max(20),
  reps: z.coerce.number().int().min(1).max(200),
  weight: z.coerce.number().min(0).max(500).optional(),
  restSeconds: z.coerce.number().int().min(0).max(600).optional(),
  tempo: z.string().trim().max(60).optional(),
  instructions: z.string().trim().max(1000).optional(),
  estimatedTempo: z.coerce.number().int().min(0).max(600).optional(),
});

const workoutBlockSchema = z.object({
  title: z.string().trim().min(2).max(160),
  notes: z.string().trim().max(2000).optional(),
  order: z.coerce.number().int().min(0),
  exercises: z.array(workoutExerciseSchema).min(1),
});

const workoutBaseSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(4000).optional(),
  difficulty: z.nativeEnum(WorkoutDifficulty).default(WorkoutDifficulty.INTERMEDIATE),
  status: z.nativeEnum(WorkoutStatus).default(WorkoutStatus.DRAFT),
  frequency: z.string().trim().max(120).optional(),
  schedule: z.array(z.string().trim().min(1).max(30)).max(14).optional(),
  startDate: isoDate.optional(),
  endDate: isoDate.optional(),
  estimatedDuration: z.coerce.number().int().min(0).max(600).optional(),
  estimatedCalories: z.coerce.number().int().min(0).max(5000).optional(),
  isTemplate: z.boolean().optional(),
  trainerId: z.string().cuid().optional(),
  clientId: z.string().cuid().optional(),
  blocks: z.array(workoutBlockSchema).min(1),
});

const updateWorkoutSchema = workoutBaseSchema.partial().extend({
  blocks: workoutBaseSchema.shape.blocks.optional(),
});

const listFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  perPage: z.coerce.number().int().min(1).max(100).optional(),
  status: z.nativeEnum(WorkoutStatus).optional(),
  template: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      if (typeof value === 'boolean') return value;
      return value === 'true';
    }),
  trainerId: z.string().cuid().optional(),
  clientId: z.string().cuid().optional(),
  search: z.string().trim().min(1).optional(),
});

const workoutSelect = {
  id: true,
  trainerId: true,
  clientId: true,
  title: true,
  description: true,
  difficulty: true,
  status: true,
  frequency: true,
  schedule: true,
  startDate: true,
  endDate: true,
  estimatedDuration: true,
  estimatedCalories: true,
  isTemplate: true,
  createdAt: true,
  updatedAt: true,
  trainer: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  client: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  blocks: {
    orderBy: { order: 'asc' },
    select: {
      id: true,
      title: true,
      notes: true,
      order: true,
      exercises: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          order: true,
          sets: true,
          reps: true,
          weight: true,
          restSeconds: true,
          tempo: true,
          instructions: true,
          estimatedTempo: true,
          exercise: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
              primaryMuscle: true,
              difficulty: true,
              imageUrl: true,
              videoUrl: true,
              caloriesPerSet: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.WorkoutSelect;

type WorkoutPayload = Prisma.WorkoutGetPayload<{ select: typeof workoutSelect }>;

function serializeWorkout(workout: WorkoutPayload) {
  return {
    id: workout.id,
    trainerId: workout.trainerId,
    clientId: workout.clientId,
    title: workout.title,
    description: workout.description,
    difficulty: workout.difficulty,
    status: workout.status,
    frequency: workout.frequency,
    schedule: workout.schedule,
    startDate: workout.startDate,
    endDate: workout.endDate,
    estimatedDuration: workout.estimatedDuration,
    estimatedCalories: workout.estimatedCalories,
    isTemplate: workout.isTemplate,
    createdAt: workout.createdAt,
    updatedAt: workout.updatedAt,
    trainer: workout.trainer,
    client: workout.client,
    blocks: workout.blocks.map((block) => ({
      id: block.id,
      title: block.title,
      notes: block.notes,
      order: block.order,
      exercises: block.exercises.map((item) => ({
        id: item.id,
        order: item.order,
        sets: item.sets,
        reps: item.reps,
        weight: item.weight,
        restSeconds: item.restSeconds,
        tempo: item.tempo,
        instructions: item.instructions,
        estimatedTempo: item.estimatedTempo,
        exercise: item.exercise,
      })),
    })),
  };
}

function normalizePage(input?: number) {
  if (!input || Number.isNaN(input) || input <= 0) {
    return DEFAULT_PAGE;
  }
  return input;
}

function normalizePerPage(input?: number) {
  if (!input || Number.isNaN(input) || input <= 0) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(100, input);
}

function ensureTrainerContext(user: AuthenticatedUser, trainerId?: string | null) {
  if (user.roles.includes('admin')) {
    return trainerId ?? null;
  }

  if (user.roles.includes('trainer')) {
    if (trainerId && trainerId !== user.id) {
      throw createHttpError(403, 'Treinadores só podem gerenciar os próprios treinos');
    }
    return user.id;
  }

  throw createHttpError(403, 'Somente treinadores ou administradores podem gerenciar treinos');
}

async function ensureTrainerClientLink(trainerId: string, clientId: string) {
  const assignment = await prisma.trainerClient.findFirst({
    where: {
      trainerId,
      clientId,
      status: { in: [TrainerClientStatus.ACTIVE, TrainerClientStatus.PAUSED] },
    },
  });

  if (!assignment) {
    throw createHttpError(422, 'O cliente informado não está vinculado a este treinador');
  }
}

async function ensureExercisesExist(exerciseIds: string[]) {
  if (exerciseIds.length === 0) {
    throw createHttpError(422, 'Informe ao menos um exercício');
  }

  const uniqueIds = Array.from(new Set(exerciseIds));
  const exercises = await prisma.exercise.findMany({
    where: { id: { in: uniqueIds }, deletedAt: null },
    select: { id: true },
  });

  if (exercises.length !== uniqueIds.length) {
    const foundIds = new Set(exercises.map((item) => item.id));
    const missing = uniqueIds.filter((id) => !foundIds.has(id));
    throw createHttpError(404, `Exercícios não encontrados: ${missing.join(', ')}`);
  }
}

function validateDateRange(start?: Date, end?: Date) {
  if (start && end && start.getTime() > end.getTime()) {
    throw createHttpError(422, 'A data final deve ser posterior à data inicial');
  }
}

export async function listWorkouts(params: { user: AuthenticatedUser } & Partial<z.infer<typeof listFiltersSchema>>) {
  const filters = listFiltersSchema.parse(params);
  const page = normalizePage(filters.page);
  const perPage = normalizePerPage(filters.perPage);

  const where: Prisma.WorkoutWhereInput = {
    deletedAt: null,
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.template !== undefined) {
    where.isTemplate = filters.template;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const user = params.user;

  if (user.roles.includes('admin')) {
    if (filters.trainerId) {
      where.trainerId = filters.trainerId;
    }
    if (filters.clientId) {
      where.clientId = filters.clientId;
    }
  } else if (user.roles.includes('trainer')) {
    where.trainerId = user.id;
    if (filters.clientId) {
      where.clientId = filters.clientId;
    }
  } else if (user.roles.includes('client')) {
    where.clientId = user.id;
    where.isTemplate = false;
  } else {
    throw createHttpError(403, 'Permissões insuficientes');
  }

  const skip = (page - 1) * perPage;

  const [total, items] = await prisma.$transaction([
    prisma.workout.count({ where }),
    prisma.workout.findMany({
      where,
      select: workoutSelect,
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
  ]);

  return {
    data: items.map(serializeWorkout),
    pagination: {
      page,
      perPage,
      total,
      totalPages: total === 0 ? 1 : Math.ceil(total / perPage),
    },
  };
}

export async function createWorkout(user: AuthenticatedUser, payload: unknown) {
  const result = workoutBaseSchema.safeParse(payload);
  if (!result.success) {
    throw createHttpError(422, 'Validation failed', { errors: result.error.flatten() });
  }

  const data = result.data;
  const trainerId = ensureTrainerContext(user, data.trainerId);

  if (!trainerId) {
    throw createHttpError(422, 'Informe o treinador responsável pelo treino');
  }

  if (data.clientId && !data.isTemplate) {
    await ensureTrainerClientLink(trainerId, data.clientId);
  }

  const allExerciseIds = data.blocks.flatMap((block) => block.exercises.map((exercise) => exercise.exerciseId));
  await ensureExercisesExist(allExerciseIds);

  validateDateRange(data.startDate, data.endDate);

  const created = await prisma.workout.create({
    data: {
      id: randomUUID(),
      trainerId,
      clientId: data.isTemplate ? null : data.clientId ?? null,
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      status: data.status,
      frequency: data.frequency ?? null,
      schedule: data.schedule ?? [],
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      estimatedDuration: data.estimatedDuration ?? null,
      estimatedCalories: data.estimatedCalories ?? null,
      isTemplate: Boolean(data.isTemplate),
      blocks: {
        create: data.blocks.map((block) => ({
          id: randomUUID(),
          title: block.title,
          notes: block.notes,
          order: block.order,
          exercises: {
            create: block.exercises.map((exercise) => ({
              id: randomUUID(),
              exerciseId: exercise.exerciseId,
              order: exercise.order,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight ?? null,
              restSeconds: exercise.restSeconds ?? null,
              tempo: exercise.tempo ?? null,
              instructions: exercise.instructions ?? null,
              estimatedTempo: exercise.estimatedTempo ?? null,
            })),
          },
        })),
      },
    },
    select: workoutSelect,
  });

  await recordAuditLog({
    userId: user.id,
    action: 'workout.create',
    entity: 'workout',
    entityId: created.id,
    metadata: {
      trainerId,
      clientId: created.clientId,
      title: created.title,
    },
  });

  return serializeWorkout(created);
}

export async function getWorkout(user: AuthenticatedUser, id: string) {
  const workout = await prisma.workout.findFirst({
    where: { id, deletedAt: null },
    select: workoutSelect,
  });

  if (!workout) {
    throw createHttpError(404, 'Treino não encontrado');
  }

  if (user.roles.includes('admin')) {
    return serializeWorkout(workout);
  }

  if (user.roles.includes('trainer') && workout.trainerId === user.id) {
    return serializeWorkout(workout);
  }

  if (user.roles.includes('client') && workout.clientId === user.id) {
    return serializeWorkout(workout);
  }

  throw createHttpError(403, 'Você não tem permissão para acessar este treino');
}

export async function updateWorkout(user: AuthenticatedUser, id: string, payload: unknown) {
  const result = updateWorkoutSchema.safeParse(payload);
  if (!result.success) {
    throw createHttpError(422, 'Validation failed', { errors: result.error.flatten() });
  }

  const workout = await prisma.workout.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, trainerId: true, clientId: true, isTemplate: true },
  });

  if (!workout) {
    throw createHttpError(404, 'Treino não encontrado');
  }

  if (!user.roles.includes('admin') && !(user.roles.includes('trainer') && workout.trainerId === user.id)) {
    throw createHttpError(403, 'Você não tem permissão para editar este treino');
  }

  const data = result.data;

  if (data.clientId && !workout.isTemplate) {
    await ensureTrainerClientLink(workout.trainerId, data.clientId);
  }

  if (data.blocks) {
    const exerciseIds = data.blocks.flatMap((block) => block.exercises.map((exercise) => exercise.exerciseId));
    await ensureExercisesExist(exerciseIds);
  }

  validateDateRange(data.startDate ?? undefined, data.endDate ?? undefined);

  await prisma.$transaction(async (tx) => {
    await tx.workout.update({
      where: { id },
      data: {
        title: data.title ?? undefined,
        description: data.description ?? undefined,
        difficulty: data.difficulty ?? undefined,
        status: data.status ?? undefined,
        frequency: data.frequency ?? undefined,
        schedule: data.schedule ?? undefined,
        startDate: data.startDate ?? undefined,
        endDate: data.endDate ?? undefined,
        estimatedDuration: data.estimatedDuration ?? undefined,
        estimatedCalories: data.estimatedCalories ?? undefined,
        isTemplate: data.isTemplate ?? undefined,
        clientId: data.isTemplate ? null : data.clientId ?? undefined,
      },
    });

    if (data.blocks) {
      await tx.workoutBlock.deleteMany({ where: { workoutId: id } });

      for (const block of data.blocks) {
        await tx.workoutBlock.create({
          data: {
            id: randomUUID(),
            workoutId: id,
            title: block.title,
            notes: block.notes,
            order: block.order,
            exercises: {
              create: block.exercises.map((exercise) => ({
                id: randomUUID(),
                exerciseId: exercise.exerciseId,
                order: exercise.order,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight ?? null,
                restSeconds: exercise.restSeconds ?? null,
                tempo: exercise.tempo ?? null,
                instructions: exercise.instructions ?? null,
                estimatedTempo: exercise.estimatedTempo ?? null,
              })),
            },
          },
        });
      }
    }
  });

  const updated = await prisma.workout.findUniqueOrThrow({
    where: { id },
    select: workoutSelect,
  });

  await recordAuditLog({
    userId: user.id,
    action: 'workout.update',
    entity: 'workout',
    entityId: id,
    metadata: data,
  });

  return serializeWorkout(updated);
}

export async function deleteWorkout(user: AuthenticatedUser, id: string) {
  const workout = await prisma.workout.findFirst({
    where: { id, deletedAt: null },
    select: { trainerId: true },
  });

  if (!workout) {
    throw createHttpError(404, 'Treino não encontrado');
  }

  if (!user.roles.includes('admin') && !(user.roles.includes('trainer') && workout.trainerId === user.id)) {
    throw createHttpError(403, 'Você não tem permissão para excluir este treino');
  }

  await prisma.workout.update({
    where: { id },
    data: { deletedAt: new Date(), status: WorkoutStatus.ARCHIVED },
  });

  await recordAuditLog({
    userId: user.id,
    action: 'workout.delete',
    entity: 'workout',
    entityId: id,
  });
}

const sessionSchema = z.object({
  performedAt: isoDate.optional(),
  durationMinutes: z.coerce.number().int().min(0).max(600).optional(),
  perceivedEffort: z.coerce.number().int().min(1).max(10).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export async function registerWorkoutSession(
  user: AuthenticatedUser,
  workoutId: string,
  payload: unknown,
) {
  const workout = await prisma.workout.findFirst({
    where: { id: workoutId, deletedAt: null },
    select: { id: true, trainerId: true, clientId: true },
  });

  if (!workout) {
    throw createHttpError(404, 'Treino não encontrado');
  }

  const result = sessionSchema.safeParse(payload);
  if (!result.success) {
    throw createHttpError(422, 'Validation failed', { errors: result.error.flatten() });
  }

  if (user.roles.includes('admin')) {
    // allow
  } else if (user.roles.includes('trainer')) {
    if (workout.trainerId !== user.id) {
      throw createHttpError(403, 'Você não pode registrar sessões para este treino');
    }
  } else if (user.roles.includes('client')) {
    if (workout.clientId !== user.id) {
      throw createHttpError(403, 'Você não está associado a este treino');
    }
  } else {
    throw createHttpError(403, 'Permissões insuficientes');
  }

  if (!workout.clientId) {
    throw createHttpError(422, 'Associe um cliente ao treino antes de registrar sessões');
  }

  const created = await prisma.sessionLog.create({
    data: {
      id: randomUUID(),
      workoutId: workout.id,
      clientId: workout.clientId,
      performedAt: result.data.performedAt ?? new Date(),
      durationMinutes: result.data.durationMinutes ?? null,
      perceivedEffort: result.data.perceivedEffort ?? null,
      notes: result.data.notes ?? null,
    },
  });

  await recordAuditLog({
    userId: user.id,
    action: 'session.create',
    entity: 'sessionLog',
    entityId: created.id,
    metadata: {
      workoutId: workout.id,
      clientId: workout.clientId,
    },
  });

  return created;
}

export async function listWorkoutSessions(user: AuthenticatedUser, workoutId: string) {
  const workout = await prisma.workout.findFirst({
    where: { id: workoutId, deletedAt: null },
    select: { trainerId: true, clientId: true },
  });

  if (!workout) {
    throw createHttpError(404, 'Treino não encontrado');
  }

  if (user.roles.includes('admin')) {
    // allow
  } else if (user.roles.includes('trainer')) {
    if (workout.trainerId !== user.id) {
      throw createHttpError(403, 'Você não tem permissão para visualizar estas sessões');
    }
  } else if (user.roles.includes('client')) {
    if (workout.clientId !== user.id) {
      throw createHttpError(403, 'Você não está associado a este treino');
    }
  } else {
    throw createHttpError(403, 'Permissões insuficientes');
  }

  const logs = await prisma.sessionLog.findMany({
    where: { workoutId },
    orderBy: { performedAt: 'desc' },
  });

  return logs;
}

function startOfWeek(date: Date) {
  const resultDate = new Date(date);
  const day = resultDate.getDay();
  const diff = (day + 6) % 7;
  resultDate.setDate(resultDate.getDate() - diff);
  resultDate.setHours(0, 0, 0, 0);
  return resultDate;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function normalizeChartEntries<T extends { name: string; value: number }>(entries: T[], fallbackLabel: string): T[] {
  if (!entries || entries.length === 0) {
    return [
      {
        name: fallbackLabel,
        value: 0,
      } as T,
    ];
  }
  return entries;
}

export async function getWorkoutSummary(user: AuthenticatedUser, trainerId?: string) {
  const resolvedTrainerId = user.roles.includes('admin') ? trainerId ?? null : user.roles.includes('trainer') ? user.id : null;
  const isClient = user.roles.includes('client');

  if (!resolvedTrainerId && !isClient && !user.roles.includes('admin')) {
    throw createHttpError(403, 'Permissões insuficientes');
  }

  if (isClient) {
    const [activeWorkouts, completedThisWeek, nextWorkout, recentSessions] = await prisma.$transaction([
      prisma.workout.count({
        where: {
          clientId: user.id,
          deletedAt: null,
          isTemplate: false,
          status: { in: [WorkoutStatus.DRAFT, WorkoutStatus.ACTIVE] },
        },
      }),
      prisma.sessionLog.count({
        where: {
          clientId: user.id,
          performedAt: { gte: startOfWeek(new Date()) },
        },
      }),
      prisma.workout.findFirst({
        where: {
          clientId: user.id,
          deletedAt: null,
          isTemplate: false,
          status: { in: [WorkoutStatus.DRAFT, WorkoutStatus.ACTIVE] },
        },
        orderBy: [
          { startDate: 'asc' },
          { createdAt: 'asc' },
        ],
        select: workoutSelect,
      }),
      prisma.sessionLog.findMany({
        where: { clientId: user.id },
        orderBy: { performedAt: 'desc' },
        take: 10,
      }),
    ]);

    const performanceGroup = await prisma.sessionLog.groupBy({
      by: ['clientId'],
      where: { clientId: user.id },
      _count: { _all: true },
    });

    const performanceData = normalizeChartEntries(
      performanceGroup.map((item, index) => ({
        name: `Treino ${index + 1}`,
        value: item._count._all,
      })),
      'Sem registros',
    );

    const cards = [
      {
        id: 'next-workout',
        title: 'Próximo treino',
        value: nextWorkout ? nextWorkout.title : 'Sem plano',
        subtitle: nextWorkout?.startDate
          ? `Início em ${nextWorkout.startDate.toLocaleDateString('pt-BR')}`
          : 'Agende com seu coach',
        icon: 'Clock',
        color: 'bg-primary',
        action: { label: 'Ver treinos', href: '/criar-treinos' },
      },
      {
        id: 'completed-week',
        title: 'Sessões na semana',
        value: `${completedThisWeek}`,
        subtitle: 'Treinos registrados',
        icon: 'TrendingUp',
        color: 'bg-success',
      },
      {
        id: 'active-workouts',
        title: 'Planos ativos',
        value: `${activeWorkouts}`,
        subtitle: 'Treinos em andamento',
        icon: 'Dumbbell',
        color: 'bg-secondary',
      },
    ];

    const schedule = nextWorkout
      ? [
          {
            id: nextWorkout.id,
            title: nextWorkout.title,
            date: nextWorkout.startDate?.toISOString() ?? nextWorkout.createdAt.toISOString(),
            status: nextWorkout.status,
            type: 'workout',
            trainer: nextWorkout.trainer,
          },
        ]
      : [];

    const activities = recentSessions.map((session) => ({
      id: session.id,
      type: 'workout',
      title: 'Treino concluído',
      description: session.notes ?? 'Sessão registrada',
      timestamp: session.performedAt.toLocaleString('pt-BR'),
    }));

    return {
      role: 'client' as const,
      cards,
      performance: {
        title: 'Adesão geral',
        type: 'bar' as const,
        dataKey: 'value',
        data: performanceData,
        color: '#34D399',
      },
      activities,
      schedule,
    };
  }

  if (!resolvedTrainerId) {
    throw createHttpError(422, 'Informe o treinador desejado');
  }

  const weekStart = startOfWeek(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [totalClients, activeWorkouts, templateCount, sessionsThisWeek, recentSessions, upcomingWorkouts] =
    await prisma.$transaction([
      prisma.trainerClient.count({
        where: {
          trainerId: resolvedTrainerId,
          status: { in: [TrainerClientStatus.ACTIVE, TrainerClientStatus.PAUSED] },
        },
      }),
      prisma.workout.count({
        where: {
          trainerId: resolvedTrainerId,
          deletedAt: null,
          isTemplate: false,
          status: { in: [WorkoutStatus.DRAFT, WorkoutStatus.ACTIVE] },
        },
      }),
      prisma.workout.count({
        where: { trainerId: resolvedTrainerId, deletedAt: null, isTemplate: true },
      }),
      prisma.sessionLog.count({
        where: {
          workout: { trainerId: resolvedTrainerId },
          performedAt: { gte: weekStart, lt: weekEnd },
        },
      }),
      prisma.sessionLog.findMany({
        where: { workout: { trainerId: resolvedTrainerId } },
        orderBy: { performedAt: 'desc' },
        take: 10,
        include: {
          workout: { select: { title: true, client: { select: { name: true } } } },
        },
      }),
      prisma.workout.findMany({
        where: {
          trainerId: resolvedTrainerId,
          deletedAt: null,
          isTemplate: false,
          status: { in: [WorkoutStatus.DRAFT, WorkoutStatus.ACTIVE] },
          startDate: { not: null, gte: new Date() },
        },
        orderBy: { startDate: 'asc' },
        take: 5,
        select: {
          id: true,
          title: true,
          startDate: true,
          status: true,
          client: { select: { id: true, name: true } },
        },
      }),
    ]);

  const weeklyPerformanceRaw = await prisma.sessionLog.groupBy({
    by: ['workoutId'],
    where: { workout: { trainerId: resolvedTrainerId } },
    _count: { _all: true },
  });

  const weeklyPerformance = normalizeChartEntries(
    weeklyPerformanceRaw.map((item, index) => ({
      name: `Treino ${index + 1}`,
      value: item._count._all,
    })),
    'Sem registros',
  );

  const cards = [
    {
      id: 'clients',
      title: 'Alunos ativos',
      value: `${totalClients}`,
      subtitle: 'Clientes vinculados',
      icon: 'Users',
      color: 'bg-primary',
      action: { label: 'Gerenciar alunos', href: '/gerenciar-alunos' },
    },
    {
      id: 'workouts-active',
      title: 'Treinos ativos',
      value: `${activeWorkouts}`,
      subtitle: 'Em andamento',
      icon: 'Activity',
      color: 'bg-secondary',
      action: { label: 'Criar treino', href: '/criar-treinos' },
    },
    {
      id: 'templates',
      title: 'Templates salvos',
      value: `${templateCount}`,
      subtitle: 'Biblioteca pessoal',
      icon: 'Folder',
      color: 'bg-accent',
    },
    {
      id: 'sessions-week',
      title: 'Sessões na semana',
      value: `${sessionsThisWeek}`,
      subtitle: 'Treinos concluídos',
      icon: 'TrendingUp',
      color: 'bg-success',
    },
  ];

  const activities = recentSessions.map((session) => ({
    id: session.id,
    type: 'workout',
    title: session.workout?.title ?? 'Treino',
    description: session.notes ?? session.workout?.client?.name ?? 'Sessão registrada',
    timestamp: session.performedAt.toLocaleString('pt-BR'),
  }));

  const schedule = upcomingWorkouts.map((workout) => ({
    id: workout.id,
    title: workout.title,
    date: workout.startDate?.toISOString() ?? new Date().toISOString(),
    status: workout.status,
    type: 'workout',
    client: workout.client,
  }));

  return {
    role: 'trainer' as const,
    cards,
    performance: {
      title: 'Sessões registradas',
      type: 'line' as const,
      dataKey: 'value',
      color: '#2563EB',
      data: weeklyPerformance,
    },
    activities,
    schedule,
  };
}
