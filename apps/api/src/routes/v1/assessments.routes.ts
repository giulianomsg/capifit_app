import { Router } from 'express';
import { z } from 'zod';

import { requireAuth, requireRoles } from '@middlewares/auth';
import {
  assessmentDocumentUpload,
  progressPhotoUpload,
} from '@middlewares/upload';
import { storage } from '@lib/storage';
import {
  createAssessment,
  createMeasurementRecord,
  getAssessmentOverview,
  listAssessmentAttachments,
  listAssessmentClients,
  listAssessmentHistory,
  listAssessmentTemplates,
  listMeasurementHistory,
  listProgressPhotos,
  saveAssessmentAttachment,
  saveProgressPhoto,
  updateAssessment,
} from '@services/assessment-service';

const router = Router();

router.use(requireAuth);

const listClientsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'delayed', 'all']).optional(),
  trainerId: z.string().cuid().optional(),
});

router.get('/overview', async (req, res, next) => {
  try {
    const trainerId = typeof req.query.trainerId === 'string' ? req.query.trainerId : undefined;
    const overview = await getAssessmentOverview({ user: req.user, trainerId });
    res.json(overview);
  } catch (error) {
    next(error);
  }
});

router.get('/clients', async (req, res, next) => {
  try {
    const query = listClientsQuerySchema.parse(req.query);
    const clients = await listAssessmentClients({
      user: req.user,
      search: query.search,
      status: query.status,
      trainerId: query.trainerId,
    });
    res.json({ clients });
  } catch (error) {
    next(error);
  }
});

router.get('/templates', async (req, res, next) => {
  try {
    const trainerId = typeof req.query.trainerId === 'string' ? req.query.trainerId : undefined;
    const templates = await listAssessmentTemplates({ user: req.user, trainerId });
    res.json({ templates });
  } catch (error) {
    next(error);
  }
});

router.get('/history', async (req, res, next) => {
  try {
    const trainerId = typeof req.query.trainerId === 'string' ? req.query.trainerId : undefined;
    const clientId = typeof req.query.clientId === 'string' ? req.query.clientId : undefined;
    const limit = req.query.limit ? z.coerce.number().int().min(1).max(200).parse(req.query.limit) : undefined;

    const history = await listAssessmentHistory({ user: req.user, trainerId, clientId, limit });
    res.json({ history });
  } catch (error) {
    next(error);
  }
});

const createAssessmentSchema = z.object({
  clientId: z.string().cuid(),
  templateId: z.string().cuid().nullable().optional(),
  scheduledFor: z.string().datetime().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  type: z.string().nullable().optional(),
});

router.post('/', requireRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const body = createAssessmentSchema.parse(req.body);
    const assessment = await createAssessment({ user: req.user, data: body });
    res.status(201).json({ assessment });
  } catch (error) {
    next(error);
  }
});

const updateAssessmentSchema = z.object({
  status: z.enum(['DRAFT', 'SCHEDULED', 'COMPLETED', 'MISSED']).optional(),
  performedAt: z.string().datetime().nullable().optional(),
  metrics: z.record(z.any()).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

router.patch('/:assessmentId', requireRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const assessmentId = z.string().min(3).parse(req.params.assessmentId);
    const body = updateAssessmentSchema.parse(req.body);
    const assessment = await updateAssessment({ user: req.user, assessmentId, data: body });
    res.json({ assessment });
  } catch (error) {
    next(error);
  }
});

router.get('/clients/:clientId/measurements', async (req, res, next) => {
  try {
    const clientId = z.string().cuid().parse(req.params.clientId);
    const limit = req.query.limit ? z.coerce.number().int().min(1).max(200).parse(req.query.limit) : undefined;
    const measurements = await listMeasurementHistory({ user: req.user, clientId, limit });
    res.json({ measurements });
  } catch (error) {
    next(error);
  }
});

const measurementSchema = z.object({
  assessmentId: z.string().cuid().nullable().optional(),
  recordedAt: z.string().datetime().nullable().optional(),
  weightKg: z.coerce.number().min(0).nullable().optional(),
  heightCm: z.coerce.number().min(0).nullable().optional(),
  bodyFat: z.coerce.number().min(0).max(100).nullable().optional(),
  muscleMass: z.coerce.number().min(0).nullable().optional(),
  chest: z.coerce.number().min(0).nullable().optional(),
  waist: z.coerce.number().min(0).nullable().optional(),
  hip: z.coerce.number().min(0).nullable().optional(),
  thigh: z.coerce.number().min(0).nullable().optional(),
  bicep: z.coerce.number().min(0).nullable().optional(),
  forearm: z.coerce.number().min(0).nullable().optional(),
  calf: z.coerce.number().min(0).nullable().optional(),
  neck: z.coerce.number().min(0).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  data: z.record(z.any()).nullable().optional(),
});

router.post('/clients/:clientId/measurements', requireRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const clientId = z.string().cuid().parse(req.params.clientId);
    const body = measurementSchema.parse(req.body);
    const measurement = await createMeasurementRecord({
      user: req.user,
      clientId,
      assessmentId: body.assessmentId ?? undefined,
      payload: body,
    });
    res.status(201).json({ measurement });
  } catch (error) {
    next(error);
  }
});

router.get('/clients/:clientId/photos', async (req, res, next) => {
  try {
    const clientId = z.string().cuid().parse(req.params.clientId);
    const photos = await listProgressPhotos({ user: req.user, clientId });
    res.json({ photos });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/clients/:clientId/photos',
  requireRoles('admin', 'trainer'),
  progressPhotoUpload.single('file'),
  async (req, res, next) => {
    try {
      const clientId = z.string().cuid().parse(req.params.clientId);
      const capturedAt = typeof req.body.capturedAt === 'string' ? req.body.capturedAt : undefined;
      const photo = await saveProgressPhoto({
        user: req.user,
        clientId,
        assessmentId: typeof req.body.assessmentId === 'string' ? req.body.assessmentId : undefined,
        capturedAt,
        file: req.file,
      });
      res.status(201).json({ photo });
    } catch (error) {
      if (req.file) {
        await storage.removeFile(storage.relativeFromFile(req.file.path));
      }
      next(error);
    }
  },
);

router.get('/clients/:clientId/exams', async (req, res, next) => {
  try {
    const clientId = z.string().cuid().parse(req.params.clientId);
    const attachments = await listAssessmentAttachments({ user: req.user, clientId });
    res.json({ attachments });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/clients/:clientId/exams',
  requireRoles('admin', 'trainer'),
  assessmentDocumentUpload.single('file'),
  async (req, res, next) => {
    try {
      const clientId = z.string().cuid().parse(req.params.clientId);
      const attachment = await saveAssessmentAttachment({
        user: req.user,
        clientId,
        assessmentId: typeof req.body.assessmentId === 'string' ? req.body.assessmentId : undefined,
        file: req.file,
      });
      res.status(201).json({ attachment });
    } catch (error) {
      if (req.file) {
        await storage.removeFile(storage.relativeFromFile(req.file.path));
      }
      next(error);
    }
  },
);

export const assessmentsRouter = router;
