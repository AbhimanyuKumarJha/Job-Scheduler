import { Request, Response, NextFunction } from 'express';
import { ExecutionService } from '../services/execution.service';
import { createLogger } from '../config/logger';

const controllerLogger = createLogger('ExecutionController');
const executionService = new ExecutionService();

export class ExecutionController {
    async getExecution(req: Request, res: Response, next: NextFunction) {
        try {
            const { executionId } = req.params;
            const execution = await executionService.getExecutionById(executionId);

            res.json(execution);
        } catch (error) {
            controllerLogger.error('Failed to get execution via API', {
                executionId: req.params.executionId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            next(error);
        }
    }

    async getSystemMetrics(req: Request, res: Response, next: NextFunction) {
        try {
            const metrics = await executionService.getSystemMetrics();
            res.json(metrics);
        } catch (error) {
            controllerLogger.error('Failed to get system metrics via API', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            next(error);
        }
    }

    async getJobMetrics(req: Request, res: Response, next: NextFunction) {
        try {
            const { jobId } = req.params;
            const metrics = await executionService.getJobMetrics(jobId);
            res.json(metrics);
        } catch (error) {
            controllerLogger.error('Failed to get job metrics via API', {
                jobId: req.params.jobId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            next(error);
        }
    }
}
