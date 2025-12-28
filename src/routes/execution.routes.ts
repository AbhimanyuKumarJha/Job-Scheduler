import { Router } from 'express';
import { ExecutionController } from '../controllers/execution.controller';

const router = Router();
const executionController = new ExecutionController();

router.get('/:executionId', executionController.getExecution.bind(executionController));

export default router;
