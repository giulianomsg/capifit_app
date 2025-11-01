import { Router } from 'express';
import createHttpError from 'http-errors';
import { z } from 'zod';
import { WorkoutStatus } from '@prisma/client';

import { requireAuth, requireRoles } from '../../middlewares/auth';
import {
  createWorkout,
  deleteWorkout,
  getWorkout,
  getWorkoutSummary,
  listWorkoutSessions,
  listWorkouts,
  registerWorkoutSession,
  updateWorkout,
} from '../../services/workout-service';

const router = Router();

const positiveInt = z.coerce.number().int().min(1);
const idParam = z.string().min(3);
const templateFlagSchema = z.union([z.boolean(), z.enum(['true', 'false'])]).transform((value) => {
  if (typeof value === 'boolean') {
    return value;
  }
  return value === 'true';
});

router.use(requireAuth);

router.get('/summary', async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required');
    }

    const trainerId = typeof req.query.trainerId === 'string' ? req.query.trainerId : undefined;
    const summary = await getWorkoutSummary(req.user, trainerId);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required');
    }

    const page = req.query.page ? positiveInt.parse(req.query.page) : undefined;
    const perPage = req.query.perPage ? Math.min(positiveInt.parse(req.query.perPage), 100) : undefined;
    const status = typeof req.query.status === 'string' ? z.nativeEnum(WorkoutStatus).parse(req.query.status) : undefined;
    const template =
      req.query.template !== undefined && req.query.template !== ''
        ? templateFlagSchema.parse(req.query.template)
        : undefined;
    const trainerId = typeof req.query.trainerId === 'string' ? req.query.trainerId : undefined;
    const clientId = typeof req.query.clientId === 'string' ? req.query.clientId : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;

    const result = await listWorkouts({
      user: req.user,
      page,
      perPage,
      status,
      template,
      trainerId,
      clientId,
      search,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/', requireRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required');
    }

    const workout = await createWorkout(req.user, req.body);
    res.status(201).json({ workout });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required');
    }

    const id = idParam.parse(req.params.id);
    const workout = await getWorkout(req.user, id);
    res.json({ workout });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', requireRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required');
    }

    const id = idParam.parse(req.params.id);
    const workout = await updateWorkout(req.user, id, req.body);
    res.json({ workout });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required');
    }

    const id = idParam.parse(req.params.id);
    await deleteWorkout(req.user, id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/:id/sessions', async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required');
    }

    const id = idParam.parse(req.params.id);
    const sessions = await listWorkoutSessions(req.user, id);
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/sessions', async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required');
    }

    const id = idParam.parse(req.params.id);
    const session = await registerWorkoutSession(req.user, id, req.body);
    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
});

export { router as workoutsRouter };
