import { Router } from 'express';

import { requireAuth, requireRoles } from '@middlewares/auth';
import {
  deleteNotifications,
  getPreferences,
  listNotifications,
  markNotifications,
  updatePreferences,
} from '@services/notification-service';
import { getNotificationQueueHealth } from '@jobs/notification-queue';

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get('/health', requireRoles('admin'), async (_req, res, next) => {
  try {
    const health = await getNotificationQueueHealth();
    res.json(health);
  } catch (error) {
    next(error);
  }
});

notificationsRouter.get('/', async (req, res, next) => {
  try {
    const result = await listNotifications(req.user!.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

notificationsRouter.post('/mark-read', async (req, res, next) => {
  try {
    const result = await markNotifications(req.user!.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

notificationsRouter.delete('/', async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? (req.body.ids as string[]) : [];
    const result = await deleteNotifications(req.user!.id, ids);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

notificationsRouter.get('/preferences', async (req, res, next) => {
  try {
    const preference = await getPreferences(req.user!.id);
    res.json(preference);
  } catch (error) {
    next(error);
  }
});

notificationsRouter.put('/preferences', async (req, res, next) => {
  try {
    const preference = await updatePreferences(req.user!.id, req.body);
    res.json(preference);
  } catch (error) {
    next(error);
  }
});
