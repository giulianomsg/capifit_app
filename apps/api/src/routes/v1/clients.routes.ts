import { Router } from 'express';
import createHttpError from 'http-errors';
import { z } from 'zod';
import {
  ActivityLevel,
  PaymentStatus,
  SubscriptionPlan,
  TrainerClientStatus,
} from '@prisma/client';

import { requireAuth, requireRoles } from '../../middlewares/auth';
import {
  createClientAssignment,
  listClients,
  removeClientAssignment,
  updateClientAssignment,
  type CreateClientData,
  type UpdateClientData,
} from '../../services/client-service';

const router = Router();

const positiveInt = z.coerce.number().int().min(1);
const optionalId = z.string().min(3).max(100);

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

const createClientSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().email(),
  phone: z
    .string()
    .trim()
    .min(8)
    .max(30)
    .optional(),
  subscriptionPlan: z.nativeEnum(SubscriptionPlan),
  paymentStatus: z.nativeEnum(PaymentStatus),
  activityLevel: z.nativeEnum(ActivityLevel),
  progressPercentage: z.coerce.number().int().min(0).max(100).optional(),
  goals: z.array(z.string().trim().min(1).max(120)).max(12).optional(),
  experienceLevel: z.string().trim().min(1).max(120).optional(),
  gender: z.string().trim().min(1).max(30).optional(),
  notes: z.string().trim().max(1024).optional(),
  medicalConditions: z.string().trim().max(1024).optional(),
  dateOfBirth: isoDate.optional(),
  nextAssessmentAt: isoDate.optional(),
  lastWorkoutAt: isoDate.optional(),
  sendInvitation: z.boolean().optional(),
});

const updateClientSchema = createClientSchema
  .omit({ sendInvitation: true })
  .partial()
  .extend({
    status: z.nativeEnum(TrainerClientStatus).optional(),
    email: z.string().email().optional(),
  });

type CreateClientPayload = z.infer<typeof createClientSchema>;
type UpdateClientPayload = z.infer<typeof updateClientSchema>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _CreateClientSchemaCheck = CreateClientPayload extends CreateClientData
  ? CreateClientData extends CreateClientPayload
    ? true
    : never
  : never;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _UpdateClientSchemaCheck = UpdateClientPayload extends UpdateClientData
  ? UpdateClientData extends UpdateClientPayload
    ? true
    : never
  : never;

const toCreateClientData = (payload: CreateClientPayload): CreateClientData => payload as CreateClientData;
const toUpdateClientData = (payload: UpdateClientPayload): UpdateClientData => payload as UpdateClientData;

function parseEnumList<T extends string>(value: unknown, allowed: readonly T[]) {
  if (value === undefined) {
    return undefined;
  }

  const values = Array.isArray(value) ? value : String(value).split(',');
  const normalized = values.map((item) => item.trim()).filter(Boolean) as T[];

  const invalid = normalized.filter((item) => !allowed.includes(item));
  if (invalid.length > 0) {
    throw createHttpError(422, `Invalid filter values: ${invalid.join(', ')}`);
  }

  return normalized.length > 0 ? normalized : undefined;
}

router.use(requireAuth);
router.use(requireRoles('admin', 'trainer'));

router.get('/', async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required');
    }

    const page = req.query.page ? positiveInt.parse(req.query.page) : 1;
    const perPage = req.query.perPage ? Math.min(positiveInt.parse(req.query.perPage), 100) : 25;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;

    const subscriptionPlans = parseEnumList(req.query.subscription, Object.values(SubscriptionPlan));
    const paymentStatuses = parseEnumList(req.query.paymentStatus, Object.values(PaymentStatus));
    const activityLevels = parseEnumList(req.query.activityLevel, Object.values(ActivityLevel));
    const statuses = parseEnumList(req.query.status, Object.values(TrainerClientStatus));
    const trainerId = typeof req.query.trainerId === 'string' ? optionalId.parse(req.query.trainerId) : undefined;

    const result = await listClients({
      user: req.user,
      page,
      perPage,
      search,
      subscriptionPlans,
      paymentStatuses,
      activityLevels,
      statuses,
      trainerId,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required');
    }

    const parsed = toCreateClientData(createClientSchema.parse(req.body));
    const payload: CreateClientData = {
      name: parsed.name,
      email: parsed.email,
      subscriptionPlan: parsed.subscriptionPlan,
      paymentStatus: parsed.paymentStatus,
      activityLevel: parsed.activityLevel,
      ...(parsed.phone !== undefined ? { phone: parsed.phone } : {}),
      ...(parsed.progressPercentage !== undefined ? { progressPercentage: parsed.progressPercentage } : {}),
      ...(parsed.goals !== undefined ? { goals: parsed.goals } : {}),
      ...(parsed.experienceLevel !== undefined ? { experienceLevel: parsed.experienceLevel } : {}),
      ...(parsed.gender !== undefined ? { gender: parsed.gender } : {}),
      ...(parsed.notes !== undefined ? { notes: parsed.notes } : {}),
      ...(parsed.medicalConditions !== undefined ? { medicalConditions: parsed.medicalConditions } : {}),
      ...(parsed.dateOfBirth !== undefined ? { dateOfBirth: parsed.dateOfBirth } : {}),
      ...(parsed.nextAssessmentAt !== undefined ? { nextAssessmentAt: parsed.nextAssessmentAt } : {}),
      ...(parsed.lastWorkoutAt !== undefined ? { lastWorkoutAt: parsed.lastWorkoutAt } : {}),
      ...(parsed.sendInvitation !== undefined ? { sendInvitation: parsed.sendInvitation } : {}),
    };

    const trainerId = typeof req.query.trainerId === 'string' ? optionalId.parse(req.query.trainerId) : undefined;

    const assignment = await createClientAssignment({
      user: req.user,
      trainerId,
      data: payload,
    });

    res.status(201).json({ client: assignment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createHttpError(422, 'Validation failed', { errors: error.flatten() }));
    }
    next(error);
  }
});

router.patch('/:assignmentId', async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required');
    }

    const assignmentId = optionalId.parse(req.params.assignmentId);
    const parsed = toUpdateClientData(updateClientSchema.parse(req.body));
    const payload: UpdateClientData = { ...parsed };

    const assignment = await updateClientAssignment({
      user: req.user,
      assignmentId,
      data: payload,
    });

    res.json({ client: assignment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createHttpError(422, 'Validation failed', { errors: error.flatten() }));
    }
    next(error);
  }
});

router.delete('/:assignmentId', async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required');
    }

    const assignmentId = optionalId.parse(req.params.assignmentId);

    await removeClientAssignment({
      user: req.user,
      assignmentId,
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { router as clientsRouter };
