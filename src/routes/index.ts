import { Router } from 'express';
import jobRoutes from './job.routes';
import executionRoutes from './execution.routes';
import metricsRoutes from './metrics.routes';
import healthRoutes from './health.routes';

const router = Router();

// API Routes
router.use('/jobs', jobRoutes);
router.use('/executions', executionRoutes);
router.use('/metrics', metricsRoutes);
router.use('/health', healthRoutes);

export default router;
