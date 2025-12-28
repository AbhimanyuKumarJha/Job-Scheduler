import { Router } from 'express';
import jobRoutes from './job.routes';
import executionRoutes from './execution.routes';
import metricsRoutes from './metrics.routes';

const router = Router();

router.use('/jobs', jobRoutes);
router.use('/executions', executionRoutes);
router.use('/metrics', metricsRoutes);

export default router;
