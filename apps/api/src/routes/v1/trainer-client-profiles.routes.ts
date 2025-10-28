import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TrainerClientProfileService } from '../../services/trainerClientProfile.service';
import {
  createTrainerClientProfileSchema,
  getOrDeleteTrainerClientProfileSchema,
  listTrainerClientProfileSchema,
  updateTrainerClientProfileSchema
} from '../../validators/trainerClientProfile.validator';
import { validateRequest } from '../../middleware/validateRequest';
import { withAuditTrail } from '../../middleware/auditTrail';

const router = Router();

router.get(
  '/',
  validateRequest(listTrainerClientProfileSchema),
  async (req, res) => {
    const { page, pageSize, trainerId, search } = req.query as Record<string, string>;
    const result = await TrainerClientProfileService.list({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      trainerId: trainerId ? Number(trainerId) : undefined,
      search
    });
    res.json(result);
  }
);

router.post(
  '/',
  validateRequest(createTrainerClientProfileSchema),
  async (req, res, next) => {
    try {
      const profile = await TrainerClientProfileService.create(req.body);
      res.status(StatusCodes.CREATED).json(profile);
      (res.locals as any).createdProfileId = profile.id;
    } catch (error) {
      next(error);
    }
  },
  withAuditTrail(
    'TrainerClientProfile',
    'CREATE',
    (_req, res) => (res.locals as any).createdProfileId,
    (req) => req.body,
    (_req, res) => (res.locals as any).createdProfileId
  )
);

router.get(
  '/:id',
  validateRequest(getOrDeleteTrainerClientProfileSchema),
  async (req, res) => {
    const profile = await TrainerClientProfileService.getById(Number(req.params.id));
    if (!profile) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Profile not found' });
    }
    return res.json(profile);
  }
);

router.put(
  '/:id',
  validateRequest(updateTrainerClientProfileSchema),
  async (req, res, next) => {
    try {
      const profile = await TrainerClientProfileService.update(Number(req.params.id), req.body);
      res.json(profile);
      (res.locals as any).updatedProfileId = profile.id;
      (res.locals as any).changes = req.body;
    } catch (error) {
      next(error);
    }
  },
  withAuditTrail(
    'TrainerClientProfile',
    'UPDATE',
    (_req, res) => (res.locals as any).updatedProfileId,
    (_req, res) => (res.locals as any).changes,
    (_req, res) => (res.locals as any).updatedProfileId
  )
);

router.delete(
  '/:id',
  validateRequest(getOrDeleteTrainerClientProfileSchema),
  async (req, res, next) => {
    try {
      await TrainerClientProfileService.remove(Number(req.params.id));
      res.status(StatusCodes.NO_CONTENT).send();
      (res.locals as any).deletedProfileId = Number(req.params.id);
    } catch (error) {
      next(error);
    }
  },
  withAuditTrail(
    'TrainerClientProfile',
    'DELETE',
    (_req, res) => (res.locals as any).deletedProfileId,
    () => null,
    (_req, res) => (res.locals as any).deletedProfileId
  )
);

export default router;
