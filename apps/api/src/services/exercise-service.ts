import createHttpError from 'http-errors';
import { z } from 'zod';
import {
  ExerciseCategory,
  MuscleGroup,
  Prisma,
  WorkoutDifficulty,
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
const DEFAULT_PAGE_SIZE = 25;

const exerciseSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  instructions: true,
  category: true,
  primaryMuscle: true,
  secondaryMuscle: true,
  equipment: true,
  difficulty: true,
  videoUrl: true,
  imageUrl: true,
  caloriesPerSet: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  isPublic: true,
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.ExerciseSelect;

type ExercisePayload = Prisma.ExerciseGetPayload<{ select: typeof exerciseSelect }>;

function serializeExercise(exercise: ExercisePayload) {
  return {
    id: exercise.id,
    name: exercise.name,
    slug: exercise.slug,
    description: exercise.description,
    instructions: exercise.instructions,
    category: exercise.category,
    primaryMuscle: exercise.primaryMuscle,
    secondaryMuscle: exercise.secondaryMuscle,
    equipment: exercise.equipment,
    difficulty: exercise.difficulty,
    videoUrl: exercise.videoUrl,
    imageUrl: exercise.imageUrl,
    caloriesPerSet: exercise.caloriesPerSet,
    createdAt: exercise.createdAt,
    updatedAt: exercise.updatedAt,
    isPublic: exercise.isPublic,
    createdBy: exercise.createdBy
      ? {
          id: exercise.createdBy.id,
          name: exercise.createdBy.name,
          email: exercise.createdBy.email,
        }
      : null,
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

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const filterSchema = z.object({
  search: z.string().min(1).optional(),
  categories: z
    .union([
      z.nativeEnum(ExerciseCategory),
      z.array(z.nativeEnum(ExerciseCategory)).min(1),
    ])
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      return Array.isArray(value) ? value : [value];
    }),
  muscleGroups: z
    .union([z.nativeEnum(MuscleGroup), z.array(z.nativeEnum(MuscleGroup)).min(1)])
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      return Array.isArray(value) ? value : [value];
    }),
  difficulties: z
    .union([
      z.nativeEnum(WorkoutDifficulty),
      z.array(z.nativeEnum(WorkoutDifficulty)).min(1),
    ])
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      return Array.isArray(value) ? value : [value];
    }),
  page: z.coerce.number().int().positive().optional(),
  perPage: z.coerce.number().int().positive().optional(),
});

export async function listExercises(params: unknown) {
  const filters = filterSchema.parse(params ?? {});

  const page = normalizePage(filters.page);
  const perPage = normalizePerPage(filters.perPage);

  const where: Prisma.ExerciseWhereInput = {
    deletedAt: null,
    isPublic: true,
  };

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { instructions: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.categories) {
    where.category = { in: filters.categories };
  }

  if (filters.muscleGroups) {
    where.primaryMuscle = { in: filters.muscleGroups };
  }

  if (filters.difficulties) {
    where.difficulty = { in: filters.difficulties };
  }

  const skip = (page - 1) * perPage;

  const [total, items] = await prisma.$transaction([
    prisma.exercise.count({ where }),
    prisma.exercise.findMany({
      where,
      select: exerciseSelect,
      orderBy: { name: 'asc' },
      skip,
      take: perPage,
    }),
  ]);

  const totalPages = total === 0 ? 1 : Math.ceil(total / perPage);

  return {
    data: items.map(serializeExercise),
    pagination: {
      page,
      perPage,
      total,
      totalPages,
    },
  };
}

const baseExerciseSchema = z.object({
  name: z.string().trim().min(3).max(160),
  description: z.string().trim().max(2000).optional(),
  instructions: z.string().trim().max(4000).optional(),
  category: z.nativeEnum(ExerciseCategory),
  primaryMuscle: z.nativeEnum(MuscleGroup),
  secondaryMuscle: z.nativeEnum(MuscleGroup).optional(),
  equipment: z.string().trim().max(120).optional(),
  difficulty: z.nativeEnum(WorkoutDifficulty).default(WorkoutDifficulty.INTERMEDIATE),
  videoUrl: z.string().trim().url().optional(),
  imageUrl: z.string().trim().url().optional(),
  caloriesPerSet: z.number().int().min(0).max(200).optional(),
});

function assertTrainerOrAdmin(user: AuthenticatedUser) {
  if (!user.roles.some((role) => role === 'admin' || role === 'trainer')) {
    throw createHttpError(403, 'Somente treinadores ou administradores podem gerenciar exercícios');
  }
}

export async function createExercise(user: AuthenticatedUser, payload: unknown) {
  assertTrainerOrAdmin(user);

  const result = baseExerciseSchema.safeParse(payload);
  if (!result.success) {
    throw createHttpError(422, 'Validation failed', { errors: result.error.flatten() });
  }

  const data = result.data;
  const baseSlug = toSlug(data.name);
  let slug = baseSlug;
  let counter = 0;

  // Ensure slug uniqueness by checking sequential suffixes until a free one is found.
  while (await prisma.exercise.findUnique({ where: { slug } })) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  const exercise = await prisma.exercise.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      instructions: data.instructions,
      category: data.category,
      primaryMuscle: data.primaryMuscle,
      secondaryMuscle: data.secondaryMuscle,
      equipment: data.equipment,
      difficulty: data.difficulty,
      videoUrl: data.videoUrl,
      imageUrl: data.imageUrl,
      caloriesPerSet: data.caloriesPerSet,
      createdById: user.id,
    },
    select: exerciseSelect,
  });

  await recordAuditLog({
    userId: user.id,
    action: 'exercise.create',
    entity: 'exercise',
    entityId: exercise.id,
    metadata: {
      name: exercise.name,
      slug: exercise.slug,
    },
  });

  return serializeExercise(exercise);
}

export async function getExerciseById(id: string, includePrivate = false) {
  const exercise = await prisma.exercise.findUnique({
    where: { id },
    select: exerciseSelect,
  });

  if (!exercise) {
    throw createHttpError(404, 'Exercise not found');
  }

  if (!includePrivate && (exercise.deletedAt || !exercise.isPublic)) {
    throw createHttpError(404, 'Exercise not found');
  }

  return serializeExercise(exercise);
}

const updateExerciseSchema = baseExerciseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'É necessário informar ao menos um campo para atualização' },
);

export async function updateExercise(
  user: AuthenticatedUser,
  id: string,
  payload: unknown,
) {
  assertTrainerOrAdmin(user);

  const result = updateExerciseSchema.safeParse(payload);
  if (!result.success) {
    throw createHttpError(422, 'Validation failed', { errors: result.error.flatten() });
  }

  const exercise = await prisma.exercise.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, createdById: true },
  });

  if (!exercise) {
    throw createHttpError(404, 'Exercise not found');
  }

  if (exercise.createdById && exercise.createdById !== user.id && !user.roles.includes('admin')) {
    throw createHttpError(403, 'Você não tem permissão para editar este exercício');
  }

  const updated = await prisma.exercise.update({
    where: { id },
    data: result.data,
    select: exerciseSelect,
  });

  await recordAuditLog({
    userId: user.id,
    action: 'exercise.update',
    entity: 'exercise',
    entityId: id,
    metadata: result.data,
  });

  return serializeExercise(updated);
}

export async function deleteExercise(user: AuthenticatedUser, id: string) {
  assertTrainerOrAdmin(user);

  const exercise = await prisma.exercise.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, createdById: true },
  });

  if (!exercise) {
    throw createHttpError(404, 'Exercise not found');
  }

  if (exercise.createdById && exercise.createdById !== user.id && !user.roles.includes('admin')) {
    throw createHttpError(403, 'Você não tem permissão para excluir este exercício');
  }

  await prisma.exercise.update({
    where: { id },
    data: { deletedAt: new Date(), isPublic: false },
  });

  await recordAuditLog({
    userId: user.id,
    action: 'exercise.delete',
    entity: 'exercise',
    entityId: id,
  });
}
