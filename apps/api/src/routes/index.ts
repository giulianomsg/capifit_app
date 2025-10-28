import { Router } from 'express';

import { authRouter } from './v1/auth.routes';
import { clientsRouter } from './v1/clients.routes';
import { exercisesRouter } from './v1/exercises.routes';
import { usersRouter } from './v1/users.routes';
import { workoutsRouter } from './v1/workouts.routes';
import { requireAuth } from '../middlewares/auth';

export const router = Router();

router.use('/v1/auth', authRouter);
router.use('/v1/clients', clientsRouter);
router.use('/v1/exercises', exercisesRouter);
router.use('/v1/users', usersRouter);
router.use('/v1/workouts', workoutsRouter);

router.get('/v1/profile', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
