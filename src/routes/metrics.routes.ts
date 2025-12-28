import { Router } from 'express';
import { ExecutionController } from '../controllers/execution.controller';

const router = Router();
const executionController = new ExecutionController();

// Metrics routes
router.get('/', executionController.getSystemMetrics.bind(executionController));
router.get('/jobs/:jobId', executionController.getJobMetrics.bind(executionController));

export default router;
