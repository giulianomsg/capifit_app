import { Router } from 'express';

import { authRouter } from '@routes/v1/auth.routes';
import { requireAuth } from '@middlewares/auth';

export const router = Router();

router.use('/v1/auth', authRouter);

router.get('/v1/profile', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
