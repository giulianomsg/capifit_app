import { Router } from 'express';
import trainerClientProfilesRoutes from './trainer-client-profiles.routes';

const router = Router();

router.use('/trainer-client-profiles', trainerClientProfilesRoutes);

export default router;
