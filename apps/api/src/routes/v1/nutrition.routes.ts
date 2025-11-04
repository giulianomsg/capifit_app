import { Router } from 'express';
import { z } from 'zod';

import { requireAuth, requireRoles } from '@middlewares/auth';
import { nutritionAttachmentUpload } from '@middlewares/upload';
import { storage } from '@lib/storage';
import {
  createFood,
  createNutritionPlan,
  getNutritionAnalytics,
  getNutritionOverview,
  listFoods,
  listNutritionAttachments,
  listNutritionPlans,
  saveNutritionAttachment,
  type CreateFoodData,
  type NutritionPlanPayload,
} from '@services/nutrition-service';

const router = Router();

router.use(requireAuth);

router.get('/overview', async (req, res, next) => {
  try {
    const trainerId = typeof req.query.trainerId === 'string' ? req.query.trainerId : undefined;
    const overview = await getNutritionOverview({ user: req.user, trainerId });
    res.json(overview);
  } catch (error) {
    next(error);
  }
});

router.get('/analytics', async (req, res, next) => {
  try {
    const trainerId = typeof req.query.trainerId === 'string' ? req.query.trainerId : undefined;
    const analytics = await getNutritionAnalytics({ user: req.user, trainerId });
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

const listFoodsSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  origin: z.string().optional(),
});

router.get('/foods', async (req, res, next) => {
  try {
    const query = listFoodsSchema.parse(req.query);
    const foods = await listFoods({ user: req.user, ...query });
    res.json({ foods });
  } catch (error) {
    next(error);
  }
});

const createFoodSchema = z.object({
  name: z.string().min(2).max(120),
  category: z.string().min(2).max(80),
  servingSize: z.coerce.number().int().min(1).max(1000).optional(),
  calories: z.coerce.number().min(0),
  protein: z.coerce.number().min(0).optional(),
  carbs: z.coerce.number().min(0).optional(),
  fat: z.coerce.number().min(0).optional(),
  fiber: z.coerce.number().min(0).optional(),
  sugar: z.coerce.number().min(0).optional(),
  sodium: z.coerce.number().min(0).optional(),
});

type CreateFoodPayload = z.infer<typeof createFoodSchema>;

type _CreateFoodSchemaCheck = CreateFoodPayload extends CreateFoodData
  ? CreateFoodData extends CreateFoodPayload
    ? true
    : never
  : never;

const toCreateFoodData = (payload: CreateFoodPayload): CreateFoodData => payload as CreateFoodData;

router.post('/foods', requireRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const body = toCreateFoodData(createFoodSchema.parse(req.body));
    const food = await createFood({ user: req.user, data: body });
    res.status(201).json({ food });
  } catch (error) {
    next(error);
  }
});

router.get('/plans', async (req, res, next) => {
  try {
    const trainerId = typeof req.query.trainerId === 'string' ? req.query.trainerId : undefined;
    const plans = await listNutritionPlans({ user: req.user, trainerId });
    res.json({ plans });
  } catch (error) {
    next(error);
  }
});

const nutritionPlanSchema = z.object({
  clientId: z.string().cuid(),
  title: z.string().min(2).max(160),
  description: z.string().max(2000).nullable().optional(),
  caloriesGoal: z.coerce.number().min(0).nullable().optional(),
  macros: z
    .object({
      protein: z.coerce.number().min(0).optional(),
      carbs: z.coerce.number().min(0).optional(),
      fat: z.coerce.number().min(0).optional(),
    })
    .nullable()
    .optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  meals: z
    .array(
      z.object({
        name: z.string().min(2).max(120),
        scheduledAt: z.string().datetime().nullable().optional(),
        notes: z.string().max(1000).nullable().optional(),
        items: z.array(
          z.object({
            foodId: z.string().cuid().nullable().optional(),
            customName: z.string().max(120).nullable().optional(),
            quantity: z.coerce.number().min(0).nullable().optional(),
            unit: z.string().max(20).nullable().optional(),
            macros: z
              .object({
                calories: z.coerce.number().nullable().optional(),
                protein: z.coerce.number().nullable().optional(),
                carbs: z.coerce.number().nullable().optional(),
                fat: z.coerce.number().nullable().optional(),
              })
              .nullable()
              .optional(),
          }),
        ),
      }),
    )
    .min(1),
});

type NutritionPlanFormPayload = z.infer<typeof nutritionPlanSchema>;

type _NutritionPlanSchemaCheck = NutritionPlanFormPayload extends NutritionPlanPayload
  ? NutritionPlanPayload extends NutritionPlanFormPayload
    ? true
    : never
  : never;

const toNutritionPlanPayload = (payload: NutritionPlanFormPayload): NutritionPlanPayload =>
  payload as NutritionPlanPayload;

router.post('/plans', requireRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const body = toNutritionPlanPayload(nutritionPlanSchema.parse(req.body));
    const plan = await createNutritionPlan({ user: req.user, data: body });
    res.status(201).json({ plan });
  } catch (error) {
    next(error);
  }
});

router.get('/plans/:planId/attachments', async (req, res, next) => {
  try {
    const planId = z.string().cuid().parse(req.params.planId);
    const attachments = await listNutritionAttachments({ user: req.user, planId });
    res.json({ attachments });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/plans/:planId/attachments',
  requireRoles('admin', 'trainer'),
  nutritionAttachmentUpload.single('file'),
  async (req, res, next) => {
    try {
      const planId = z.string().cuid().parse(req.params.planId);
      const attachment = await saveNutritionAttachment({ user: req.user, planId, file: req.file });
      res.status(201).json({ attachment });
    } catch (error) {
      if (req.file) {
        await storage.removeFile(storage.relativeFromFile(req.file.path));
      }
      next(error);
    }
  },
);

export const nutritionRouter = router;
