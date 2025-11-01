import { Router } from 'express';

import { requireAuth, requireRoles } from '@middlewares/auth';
import {
  createThread,
  getThread,
  listThreads,
  markThreadRead,
  sendMessage,
} from '@services/messaging-service';

export const messagingRouter = Router();

messagingRouter.use(requireAuth);

messagingRouter.get('/threads', async (req, res, next) => {
  try {
    const result = await listThreads(req.user!.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

messagingRouter.post('/threads', requireRoles('admin', 'trainer', 'client'), async (req, res, next) => {
  try {
    const thread = await createThread(req.user!.id, req.body);
    res.status(201).json(thread);
  } catch (error) {
    next(error);
  }
});

messagingRouter.get('/threads/:threadId', async (req, res, next) => {
  try {
    const thread = await getThread(req.user!.id, req.params.threadId);
    res.json(thread);
  } catch (error) {
    next(error);
  }
});

messagingRouter.post('/threads/:threadId/messages', async (req, res, next) => {
  try {
    const message = await sendMessage(req.user!.id, req.params.threadId, req.body);
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

messagingRouter.post('/threads/:threadId/read', async (req, res, next) => {
  try {
    await markThreadRead(req.user!.id, req.params.threadId, req.body);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
