import { Router } from 'express';
import { healthCheck, schedulerStatus } from '../controllers/health.controller';

const router = Router();

router.get('/health', healthCheck);
router.get('/scheduler/status', schedulerStatus);

export default router;
