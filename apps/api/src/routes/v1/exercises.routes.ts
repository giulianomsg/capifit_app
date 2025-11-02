import { Router } from 'express';
import createHttpError from 'http-errors';
import { z } from 'zod';
import { ExerciseCategory, MuscleGroup, WorkoutDifficulty } from '@prisma/client';

import { requireAuth, requireRoles } from '../../middlewares/auth';
import {
  createExercise,
  deleteExercise,
  getExerciseById,
  listExercises,
  updateExercise,
} from '../../services/exercise-service';

const router = Router();

const positiveInt = z.coerce.number().int().min(1);

function parseEnumList<T extends string>(value: unknown, allowed: readonly T[]) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const rawValues = Array.isArray(value) ? value : String(value).split(',');
  const normalized = rawValues.map((item) => item.trim()).filter(Boolean) as T[];

  const invalid = normalized.filter((item) => !allowed.includes(item));
  if (invalid.length > 0) {
    throw createHttpError(422, `Invalid filter values: ${invalid.join(', ')}`);
  }

  return normalized.length > 0 ? normalized : undefined;
}

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
    const page = req.query.page ? positiveInt.parse(req.query.page) : undefined;
    const perPage = req.query.perPage ? Math.min(positiveInt.parse(req.query.perPage), 100) : undefined;

    const categories = parseEnumList(
      req.query.category ?? req.query.categories,
      Object.values(ExerciseCategory),
    );
    const muscleGroups = parseEnumList(
      req.query.muscleGroup ?? req.query.muscleGroups,
      Object.values(MuscleGroup),
    );
    const difficulties = parseEnumList(
      req.query.difficulty ?? req.query.difficulties,
      Object.values(WorkoutDifficulty),
    );

    const response = await listExercises({
      search,
      categories,
      muscleGroups,
      difficulties,
      page,
      perPage,
    });

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = z.string().min(3).parse(req.params.id);
    const exercise = await getExerciseById(id, req.user?.roles.includes('admin') || req.user?.roles.includes('trainer'));
    res.json({ exercise });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required');
    }

    const exercise = await createExercise(req.user, req.body);
    res.status(201).json({ exercise });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', requireRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required');
    }

    const id = z.string().min(3).parse(req.params.id);
    const exercise = await updateExercise(req.user, id, req.body);
    res.json({ exercise });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required');
    }

    const id = z.string().min(3).parse(req.params.id);
    await deleteExercise(req.user, id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { router as exercisesRouter };
