import { db } from '../config/database';
import { jobs, jobExecutions, jobAuditLog } from '../db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { CreateJobInput, UpdateJobInput, JobQuery } from '../validators/schemas';
import { createLogger } from '../config/logger';
const cronParser = require('cron-parser');

const serviceLogger = createLogger('JobService');

export class JobService {
    async createJob(data: CreateJobInput, createdBy?: string) {
        try {
            serviceLogger.info('Creating new job', { name: data.name, schedule: data.schedule });

            // Validate cron expression
            try {
                cronParser.parseExpression(data.schedule);
            } catch (error) {
                throw new Error(`Invalid cron expression: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }

            const [job] = await db.insert(jobs).values({
                name: data.name,
                schedule: data.schedule,
                apiEndpoint: data.api,
                executionType: data.type || 'ATLEAST_ONCE',
                status: 'ACTIVE',
                createdBy,
                metadata: data.metadata,
                timeoutMs: data.timeoutMs,
                retryPolicy: data.retryPolicy,
                maxConcurrentExecutions: data.maxConcurrentExecutions,
                rateLimitPerMinute: data.rateLimitPerMinute,
            }).returning();

            // Create audit log
            await db.insert(jobAuditLog).values({
                jobId: job.id,
                action: 'CREATED',
                changedBy: createdBy,
                changeDetails: { initialData: data },
            });

            serviceLogger.info('Job created successfully', { jobId: job.id });
            return job;
        } catch (error) {
            serviceLogger.error('Failed to create job', { error: error instanceof Error ? error.message : 'Unknown error' });
            throw error;
        }
    }

    async getJobById(jobId: string) {
        try {
            const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

            if (!job) {
                throw new Error('Job not found');
            }

            // Calculate next scheduled run
            let nextScheduledRun = null;
            try {
                const interval = cronParser.parseExpression(job.schedule);
                nextScheduledRun = interval.next().toDate();
            } catch (error) {
                serviceLogger.warn('Failed to calculate next run', { jobId, error });
            }

            return { ...job, nextScheduledRun };
        } catch (error) {
            serviceLogger.error('Failed to get job', { jobId, error: error instanceof Error ? error.message : 'Unknown error' });
            throw error;
        }
    }

    async updateJob(jobId: string, data: UpdateJobInput, changedBy?: string) {
        try {
            serviceLogger.info('Updating job', { jobId, updates: Object.keys(data) });

            // Validate cron expression if provided
            if (data.schedule) {
                try {
                    cronParser.parseExpression(data.schedule);
                } catch (error) {
                    throw new Error(`Invalid cron expression: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }

            const updateData: any = {
                ...data,
                updatedAt: new Date(),
            };

            if (data.api) {
                updateData.apiEndpoint = data.api;
                delete updateData.api;
            }

            const [updatedJob] = await db
                .update(jobs)
                .set(updateData)
                .where(eq(jobs.id, jobId))
                .returning();

            if (!updatedJob) {
                throw new Error('Job not found');
            }

            // Create audit log
            await db.insert(jobAuditLog).values({
                jobId,
                action: 'UPDATED',
                changedBy,
                changeDetails: { updates: data },
            });

            serviceLogger.info('Job updated successfully', { jobId });
            return updatedJob;
        } catch (error) {
            serviceLogger.error('Failed to update job', { jobId, error: error instanceof Error ? error.message : 'Unknown error' });
            throw error;
        }
    }

    async deleteJob(jobId: string, changedBy?: string) {
        try {
            serviceLogger.info('Deleting job', { jobId });

            const [deletedJob] = await db
                .update(jobs)
                .set({ status: 'DELETED', updatedAt: new Date() })
                .where(eq(jobs.id, jobId))
                .returning();

            if (!deletedJob) {
                throw new Error('Job not found');
            }

            // Create audit log
            await db.insert(jobAuditLog).values({
                jobId,
                action: 'DELETED',
                changedBy,
                changeDetails: { deletedAt: new Date() },
            });

            serviceLogger.info('Job deleted successfully', { jobId });
            return deletedJob;
        } catch (error) {
            serviceLogger.error('Failed to delete job', { jobId, error: error instanceof Error ? error.message : 'Unknown error' });
            throw error;
        }
    }

    async listJobs(query: JobQuery) {
        try {
            const { page = 1, limit = 20, status, sortBy = 'createdAt', order = 'desc' } = query;
            const offset = (page - 1) * limit;

            let conditions = [];
            if (status) {
                conditions.push(eq(jobs.status, status));
            }

            const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

            const orderColumn = sortBy === 'updatedAt' ? jobs.updatedAt : jobs.createdAt;
            const orderDirection = order === 'asc' ? orderColumn : desc(orderColumn);

            const [jobList, [{ count }]] = await Promise.all([
                db.select().from(jobs).where(whereClause).orderBy(orderDirection).limit(limit).offset(offset),
                db.select({ count: sql<number>`count(*)::int` }).from(jobs).where(whereClause),
            ]);

            const total = Number(count);
            const totalPages = Math.ceil(total / limit);

            return {
                jobs: jobList,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            };
        } catch (error) {
            serviceLogger.error('Failed to list jobs', { error: error instanceof Error ? error.message : 'Unknown error' });
            throw error;
        }
    }

    async getJobExecutions(jobId: string, limit: number = 5, statusFilter?: string) {
        try {
            let conditions = [eq(jobExecutions.jobId, jobId)];

            if (statusFilter) {
                conditions.push(eq(jobExecutions.status, statusFilter as any));
            }

            const executions = await db
                .select()
                .from(jobExecutions)
                .where(and(...conditions))
                .orderBy(desc(jobExecutions.scheduledAt))
                .limit(limit);

            return executions;
        } catch (error) {
            serviceLogger.error('Failed to get job executions', { jobId, error: error instanceof Error ? error.message : 'Unknown error' });
            throw error;
        }
    }

    async triggerJob(jobId: string) {
        try {
            serviceLogger.info('Manually triggering job', { jobId });

            const job = await this.getJobById(jobId);

            if (job.status !== 'ACTIVE') {
                throw new Error('Cannot trigger inactive job');
            }

            const [execution] = await db.insert(jobExecutions).values({
                jobId,
                scheduledAt: new Date(),
                status: 'PENDING',
            }).returning();

            serviceLogger.info('Job triggered successfully', { jobId, executionId: execution.id });
            return execution;
        } catch (error) {
            serviceLogger.error('Failed to trigger job', { jobId, error: error instanceof Error ? error.message : 'Unknown error' });
            throw error;
        }
    }
}
