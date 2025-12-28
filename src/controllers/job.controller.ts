import { Request, Response, NextFunction } from 'express';
import { JobService } from '../services/job.service';
import { createJobSchema, updateJobSchema, jobQuerySchema, executionQuerySchema } from '../validators/schemas';
import { createLogger } from '../config/logger';

const controllerLogger = createLogger('JobController');
const jobService = new JobService();

export class JobController {
    async createJob(req: Request, res: Response, next: NextFunction) {
        try {
            const validated = createJobSchema.parse(req.body);
            const job = await jobService.createJob(validated, req.body.createdBy);

            controllerLogger.info('Job created via API', { jobId: job.id });

            res.status(201).json({
                jobId: job.id,
                status: job.status,
                createdAt: job.createdAt,
            });
        } catch (error) {
            controllerLogger.error('Failed to create job via API', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            next(error);
        }
    }

    async getJob(req: Request, res: Response, next: NextFunction) {
        try {
            const { jobId } = req.params;
            const job = await jobService.getJobById(jobId);

            res.json({
                jobId: job.id,
                name: job.name,
                schedule: job.schedule,
                api: job.apiEndpoint,
                type: job.executionType,
                status: job.status,
                createdAt: job.createdAt,
                updatedAt: job.updatedAt,
                nextScheduledRun: job.nextScheduledRun,
                metadata: job.metadata,
            });
        } catch (error) {
            controllerLogger.error('Failed to get job via API', {
                jobId: req.params.jobId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            next(error);
        }
    }

    async updateJob(req: Request, res: Response, next: NextFunction) {
        try {
            const { jobId } = req.params;
            const validated = updateJobSchema.parse(req.body);
            const changedBy = req.body?.changedBy || 'API';
            const job = await jobService.updateJob(jobId, validated, changedBy);

            controllerLogger.info('Job updated via API', { jobId });

            res.json({
                jobId: job.id,
                updatedAt: job.updatedAt,
            });
        } catch (error) {
            controllerLogger.error('Failed to update job via API', {
                jobId: req.params.jobId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            next(error);
        }
    }

    async deleteJob(req: Request, res: Response, next: NextFunction) {
        try {
            const { jobId } = req.params;
            const changedBy = req.body?.changedBy || 'API';
            const job = await jobService.deleteJob(jobId, changedBy);

            controllerLogger.info('Job deleted via API', { jobId });

            res.json({
                jobId: job.id,
                status: job.status,
            });
        } catch (error) {
            controllerLogger.error('Failed to delete job via API', {
                jobId: req.params.jobId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            next(error);
        }
    }

    async listJobs(req: Request, res: Response, next: NextFunction) {
        try {
            const validated = jobQuerySchema.parse(req.query);
            const result = await jobService.listJobs(validated);

            res.json(result);
        } catch (error) {
            controllerLogger.error('Failed to list jobs via API', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            next(error);
        }
    }

    async getJobExecutions(req: Request, res: Response, next: NextFunction) {
        try {
            const { jobId } = req.params;
            const validated = executionQuerySchema.parse(req.query);

            const executions = await jobService.getJobExecutions(
                jobId,
                validated.limit,
                validated.status
            );

            res.json({
                jobId,
                executions,
            });
        } catch (error) {
            controllerLogger.error('Failed to get job executions via API', {
                jobId: req.params.jobId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            next(error);
        }
    }

    async triggerJob(req: Request, res: Response, next: NextFunction) {
        try {
            const { jobId } = req.params;
            const execution = await jobService.triggerJob(jobId);

            controllerLogger.info('Job triggered manually via API', { jobId, executionId: execution.id });

            res.json({
                executionId: execution.id,
                status: execution.status,
                scheduledAt: execution.scheduledAt,
            });
        } catch (error) {
            controllerLogger.error('Failed to trigger job via API', {
                jobId: req.params.jobId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            next(error);
        }
    }

    async pauseJob(req: Request, res: Response, next: NextFunction) {
        try {
            const { jobId } = req.params;
            const changedBy = req.body?.changedBy || 'API';
            const job = await jobService.updateJob(jobId, { status: 'PAUSED' }, changedBy);

            controllerLogger.info('Job paused via API', { jobId });

            res.json({
                jobId: job.id,
                status: job.status,
                updatedAt: job.updatedAt,
            });
        } catch (error) {
            controllerLogger.error('Failed to pause job via API', {
                jobId: req.params.jobId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            next(error);
        }
    }

    async resumeJob(req: Request, res: Response, next: NextFunction) {
        try {
            const { jobId } = req.params;
            const changedBy = req.body?.changedBy || 'API';
            const job = await jobService.updateJob(jobId, { status: 'ACTIVE' }, changedBy);

            controllerLogger.info('Job resumed via API', { jobId });

            res.json({
                jobId: job.id,
                status: job.status,
                updatedAt: job.updatedAt,
            });
        } catch (error) {
            controllerLogger.error('Failed to resume job via API', {
                jobId: req.params.jobId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            next(error);
        }
    }
}
