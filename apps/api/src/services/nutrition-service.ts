import { randomUUID } from 'node:crypto';

import createHttpError from 'http-errors';
import {
  NotificationCategory,
  NotificationPriority,
  NutritionPlanStatus,
  Prisma,
  TrainerClientStatus,
} from '@prisma/client';

import { prisma } from '@lib/prisma';
import { storage } from '@lib/storage';
import { emitToUser } from '@lib/socket';
import { createNotification } from './notification-service';

interface AuthenticatedUser {
  id: string;
  roles: string[];
}

export interface NutritionPlanPayload {
  clientId: string;
  title: string;
  description?: string | null;
  caloriesGoal?: number | null;
  macros?: { protein?: number; carbs?: number; fat?: number } | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  meals: Array<{
    name: string;
    scheduledAt?: string | Date | null;
    notes?: string | null;
    items: Array<{
      foodId?: string | null;
      customName?: string | null;
      quantity?: number | null;
      unit?: string | null;
      macros?: { calories?: number; protein?: number; carbs?: number; fat?: number } | null;
    }>;
  }>;
}

function isAdmin(user: AuthenticatedUser | undefined) {
  return Boolean(user?.roles?.includes('admin'));
}

function isTrainer(user: AuthenticatedUser | undefined) {
  return Boolean(user?.roles?.includes('trainer'));
}

function ensureTrainerOrAdmin(user: AuthenticatedUser | undefined) {
  if (!user || (!isAdmin(user) && !isTrainer(user))) {
    throw createHttpError(403, 'Trainer or administrator privileges are required');
  }
}

async function ensureClientAssignment(user: AuthenticatedUser | undefined, clientId: string) {
  ensureTrainerOrAdmin(user);

  if (isAdmin(user)) {
    return;
  }

  const assignment = await prisma.trainerClient.findFirst({
    where: {
      trainerId: user!.id,
      clientId,
      status: { not: TrainerClientStatus.ENDED },
    },
  });

  if (!assignment) {
    throw createHttpError(403, 'Você não possui acesso aos dados deste cliente');
  }
}

function emitNutritionEvent(
  event: 'plan-created' | 'plan-updated',
  payload: unknown,
  recipients: Array<string | null | undefined>,
) {
  const uniqueRecipients = new Set<string>();
  for (const recipient of recipients) {
    if (typeof recipient === 'string' && recipient.trim().length > 0) {
      uniqueRecipients.add(recipient);
    }
  }
  uniqueRecipients.forEach((userId) => {
    emitToUser(userId, `nutrition:${event}`, payload);
  });
}

function buildPlanStatus(plan: { status: NutritionPlanStatus; compliance: number }) {
  if (plan.compliance >= 90) {
    return 'excellent';
  }
  if (plan.status === NutritionPlanStatus.ACTIVE) {
    return 'active';
  }
  return 'needs_attention';
}

function resolveTrainerScope(user: AuthenticatedUser | undefined, trainerId?: string | null) {
  ensureTrainerOrAdmin(user);

  if (trainerId) {
    if (!isAdmin(user) && trainerId !== user!.id) {
      throw createHttpError(403, 'Você não possui permissão para consultar este treinador');
    }
    return trainerId;
  }

  if (isTrainer(user)) {
    return user!.id;
  }

  return undefined;
}

function buildFoodResponse(food: Prisma.Food) {
  return {
    id: food.id,
    name: food.name,
    slug: food.slug,
    category: food.category,
    servingSize: food.servingSize,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    fiber: food.fiber,
    sugar: food.sugar,
    sodium: food.sodium,
    origin: food.origin,
    createdById: food.createdById,
    createdAt: food.createdAt,
    updatedAt: food.updatedAt,
  };
}

type MealWithItems = Prisma.NutritionPlanGetPayload<{
  include: { meals: { include: { items: true } } };
}>;

type MealItemWithJsonMacros = MealWithItems['meals'][number]['items'][number];

function coerceMacros(macros: MealItemWithJsonMacros['macros']) {
  if (macros === null || macros === undefined) {
    return null;
  }

  if (typeof macros !== 'object' || Array.isArray(macros)) {
    return null;
  }

  return {
    calories: Number((macros as Prisma.InputJsonObject).calories ?? 0),
    protein: Number((macros as Prisma.InputJsonObject).protein ?? 0),
    carbs: Number((macros as Prisma.InputJsonObject).carbs ?? 0),
    fat: Number((macros as Prisma.InputJsonObject).fat ?? 0),
  };
}

function computePlanCompliance(plan: MealWithItems) {
  const totals = plan.meals.reduce(
    (acc, meal) => {
      for (const item of meal.items) {
        const macros = coerceMacros(item.macros);
        if (macros) {
          acc.calories += macros.calories;
          acc.protein += macros.protein;
          acc.carbs += macros.carbs;
          acc.fat += macros.fat;
        }
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  if (!plan.caloriesGoal || plan.caloriesGoal <= 0) {
    return { compliance: 100, totals };
  }

  const compliance = Math.min(100, Math.max(0, Math.round((totals.calories / plan.caloriesGoal) * 100)));
  return { compliance, totals };
}

function buildPlanSummary(plan: Prisma.NutritionPlanGetPayload<{
  include: { client: true; meals: { include: { items: true } } };
}>) {
  const { compliance, totals } = computePlanCompliance(plan);
  return {
    id: plan.id,
    clientId: plan.clientId,
    clientName: plan.client.name,
    caloriesGoal: plan.caloriesGoal,
    startDate: plan.startDate,
    updatedAt: plan.updatedAt,
    status: buildPlanStatus({ status: plan.status, compliance }),
    compliance,
    title: plan.title,
    macros: plan.macros,
    totals,
  };
}

export interface CreateFoodData {
  name: string;
  category: string;
  servingSize?: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export async function listFoods(params: {
  user: AuthenticatedUser | undefined;
  search?: string;
  category?: string;
  origin?: string;
}) {
  ensureTrainerOrAdmin(params.user);

  const where: Prisma.FoodWhereInput = {};
  if (params.search) {
    where.name = { contains: params.search, mode: Prisma.QueryMode.insensitive };
  }
  if (params.category && params.category !== 'todos') {
    where.category = params.category;
  }
  if (params.origin) {
    where.origin = params.origin;
  }

  const foods = await prisma.food.findMany({ where, orderBy: { name: 'asc' } });
  return foods.map(buildFoodResponse);
}

export async function createFood(params: {
  user: AuthenticatedUser | undefined;
  data: CreateFoodData;
}) {
  ensureTrainerOrAdmin(params.user);

  const slug = params.data.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const food = await prisma.food.create({
    data: {
      id: randomUUID(),
      name: params.data.name,
      slug,
      category: params.data.category,
      servingSize: params.data.servingSize ?? 100,
      calories: params.data.calories,
      protein: params.data.protein ?? 0,
      carbs: params.data.carbs ?? 0,
      fat: params.data.fat ?? 0,
      fiber: params.data.fiber ?? null,
      sugar: params.data.sugar ?? null,
      sodium: params.data.sodium ?? null,
      createdById: params.user?.id,
    },
  });

  return buildFoodResponse(food);
}

export async function getNutritionOverview(params: { user: AuthenticatedUser | undefined; trainerId?: string }) {
  const trainerScope = resolveTrainerScope(params.user, params.trainerId);

  const where: Prisma.NutritionPlanWhereInput = {};
  if (trainerScope) {
    where.trainerId = trainerScope;
  }

  const plans = await prisma.nutritionPlan.findMany({
    where,
    include: { meals: { include: { items: true } }, client: true },
  });

  if (!plans.length) {
    return {
      plans: [],
      stats: {
        totalPlans: 0,
        averageCompliance: 0,
        excellentPlans: 0,
        needsAttention: 0,
      },
    };
  }

  const serialized = plans.map((plan) => {
    const { compliance, totals } = computePlanCompliance(plan);
    return {
      id: plan.id,
      title: plan.title,
      description: plan.description,
      status: plan.status,
      caloriesGoal: plan.caloriesGoal,
      macros: plan.macros,
      startDate: plan.startDate,
      endDate: plan.endDate,
      updatedAt: plan.updatedAt,
      client: {
        id: plan.clientId,
        name: plan.client.name,
        email: plan.client.email,
      },
      compliance,
      totals,
    };
  });

  const stats = serialized.reduce(
    (acc, plan) => {
      acc.totalPlans += 1;
      acc.sumCompliance += plan.compliance;
      if (plan.compliance >= 90) {
        acc.excellentPlans += 1;
      }
      if (plan.compliance < 80) {
        acc.needsAttention += 1;
      }
      return acc;
    },
    { totalPlans: 0, sumCompliance: 0, excellentPlans: 0, needsAttention: 0 },
  );

  return {
    plans: serialized,
    stats: {
      totalPlans: stats.totalPlans,
      averageCompliance: Math.round(stats.sumCompliance / serialized.length),
      excellentPlans: stats.excellentPlans,
      needsAttention: stats.needsAttention,
    },
  };
}

export async function listNutritionPlans(params: { user: AuthenticatedUser | undefined; trainerId?: string }) {
  const overview = await getNutritionOverview(params);
  return overview.plans.map((plan) => ({
    id: plan.id,
    clientId: plan.client.id,
    clientName: plan.client.name,
    caloriesGoal: plan.caloriesGoal,
    startDate: plan.startDate,
    updatedAt: plan.updatedAt,
    status: buildPlanStatus({ status: plan.status, compliance: plan.compliance }),
    compliance: plan.compliance,
    title: plan.title,
    macros: plan.macros,
    totals: plan.totals,
  }));
}

export async function getNutritionAnalytics(params: { user: AuthenticatedUser | undefined; trainerId?: string }) {
  const overview = await getNutritionOverview(params);
  const foods = await prisma.food.findMany({ include: { mealItems: true } });

  const foodUsage = foods
    .map((food) => ({
      id: food.id,
      name: food.name,
      usage: food.mealItems.length,
    }))
    .filter((item) => item.usage > 0)
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 10);

  const macroTotals = overview.plans.reduce(
    (acc, plan) => {
      acc.protein += plan.totals.protein;
      acc.carbs += plan.totals.carbs;
      acc.fat += plan.totals.fat;
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0 },
  );

  const averageCompliance = overview.stats.averageCompliance ?? 0;
  const weeklyProgress = Array.from({ length: 7 }).map((_, index) => ({
    day: index,
    adherence: Math.max(60, Math.min(100, Math.round(averageCompliance + Math.sin(index) * 5))),
  }));

  const macroSum = macroTotals.protein + macroTotals.carbs + macroTotals.fat || 1;

  return {
    averageAdherence: averageCompliance,
    mostUsedFoods: foodUsage,
    macroDistribution: {
      proteins: Math.round((macroTotals.protein / macroSum) * 100),
      carbs: Math.round((macroTotals.carbs / macroSum) * 100),
      fats: Math.round((macroTotals.fat / macroSum) * 100),
    },
    weeklyProgress,
  };
}

export async function createNutritionPlan(params: { user: AuthenticatedUser | undefined; data: NutritionPlanPayload }) {
  ensureTrainerOrAdmin(params.user);
  await ensureClientAssignment(params.user, params.data.clientId);

  const plan = await prisma.nutritionPlan.create({
    data: {
      id: randomUUID(),
      trainerId: params.user!.id,
      clientId: params.data.clientId,
      title: params.data.title,
      description: params.data.description ?? undefined,
      caloriesGoal: params.data.caloriesGoal ?? undefined,
      macros: params.data.macros ?? undefined,
      status: NutritionPlanStatus.ACTIVE,
      startDate: params.data.startDate ? new Date(params.data.startDate) : undefined,
      endDate: params.data.endDate ? new Date(params.data.endDate) : undefined,
      meals: {
        create: params.data.meals.map((meal, index) => ({
          id: randomUUID(),
          name: meal.name,
          order: index,
          scheduledAt: meal.scheduledAt ? new Date(meal.scheduledAt) : undefined,
          notes: meal.notes ?? undefined,
          items: {
            create: meal.items.map((item) => ({
              id: randomUUID(),
              foodId: item.foodId ?? undefined,
              customName: item.customName ?? undefined,
              quantity: item.quantity ?? undefined,
              unit: item.unit ?? undefined,
              macros: item.macros ?? undefined,
            })),
          },
        })),
      },
    },
    include: { meals: { include: { items: true } }, client: true },
  });

  await createNotification({
    userId: plan.clientId,
    category: NotificationCategory.NUTRITION,
    priority: NotificationPriority.NORMAL,
    title: 'Novo plano alimentar disponível',
    message: `Um novo plano nutricional "${plan.title}" foi publicado.`,
    data: { planId: plan.id },
    emailFallback: true,
  });

  const summary = buildPlanSummary(plan);

  emitNutritionEvent('plan-created', { plan: summary }, [plan.clientId, plan.trainerId]);

  return summary;
}

export async function listNutritionAttachments(params: {
  user: AuthenticatedUser | undefined;
  planId: string;
}) {
  const plan = await prisma.nutritionPlan.findUnique({ where: { id: params.planId } });
  if (!plan) {
    throw createHttpError(404, 'Plano nutricional não encontrado');
  }
  await ensureClientAssignment(params.user, plan.clientId);

  const attachments = await prisma.nutritionAttachment.findMany({
    where: { planId: params.planId },
    orderBy: { uploadedAt: 'desc' },
  });

  return attachments.map((attachment) => ({
    id: attachment.id,
    uploadedAt: attachment.uploadedAt,
    url: storage.buildPublicUrl(attachment.storagePath),
    filename: attachment.filename,
    mimeType: attachment.mimeType,
    size: attachment.size,
  }));
}

export async function saveNutritionAttachment(params: {
  user: AuthenticatedUser | undefined;
  planId: string;
  file: Express.Multer.File | undefined;
}) {
  const plan = await prisma.nutritionPlan.findUnique({ where: { id: params.planId } });
  if (!plan) {
    throw createHttpError(404, 'Plano nutricional não encontrado');
  }
  await ensureClientAssignment(params.user, plan.clientId);

  if (!params.file) {
    throw createHttpError(400, 'Arquivo é obrigatório');
  }

  const relativePath = storage.relativeFromFile(params.file.path);

  const attachment = await prisma.nutritionAttachment.create({
    data: {
      id: randomUUID(),
      trainerId: params.user!.id,
      planId: params.planId,
      storagePath: relativePath,
      filename: params.file.originalname ?? params.file.filename,
      mimeType: params.file.mimetype,
      size: params.file.size,
    },
  });

  await createNotification({
    userId: plan.clientId,
    category: NotificationCategory.NUTRITION,
    priority: NotificationPriority.LOW,
    title: 'Novo arquivo no plano nutricional',
    message: `${attachment.filename} foi adicionado ao plano ${plan.title}.`,
    data: { planId: plan.id, attachmentId: attachment.id },
  });

  emitNutritionEvent('plan-updated', {
    planId: plan.id,
    attachment: {
      id: attachment.id,
      filename: attachment.filename,
      uploadedAt: attachment.uploadedAt,
    },
  }, [plan.clientId, plan.trainerId]);

  return {
    id: attachment.id,
    uploadedAt: attachment.uploadedAt,
    url: storage.buildPublicUrl(attachment.storagePath),
    filename: attachment.filename,
    mimeType: attachment.mimeType,
    size: attachment.size,
  };
}
