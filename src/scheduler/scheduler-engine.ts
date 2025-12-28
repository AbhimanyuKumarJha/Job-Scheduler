import { CronExpressionParser } from 'cron-parser';
import { db } from '../config/database';
import { jobs, jobExecutions, schedulerMetadata } from '../db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { JobExecutor } from './job-executor';
import { schedulerLogger } from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

export class SchedulerEngine {
    private isRunning = false;
    private schedulerId: string;
    private jobExecutor: JobExecutor;
    private checkInterval = 10000; // Check every 10 seconds
    private heartbeatInterval = 30000; // Heartbeat every 30 seconds
    private jobsProcessed = 0;

    constructor() {
        this.schedulerId = `scheduler-${uuidv4()}`;
        this.jobExecutor = new JobExecutor();
    }

    async start() {
        if (this.isRunning) {
            schedulerLogger.warn('Scheduler already running');
            return;
        }

        this.isRunning = true;
        schedulerLogger.info('Starting scheduler engine', { schedulerId: this.schedulerId });

        // Register scheduler instance
        await this.registerScheduler();

        // Start heartbeat
        this.startHeartbeat();

        // Start job picker
        this.startJobPicker();
    }

    async stop() {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;
        schedulerLogger.info('Stopping scheduler engine', { schedulerId: this.schedulerId });

        // Deactivate scheduler instance
        await db.update(schedulerMetadata)
            .set({
                status: 'INACTIVE',
                updatedAt: new Date(),
            })
            .where(eq(schedulerMetadata.id, this.schedulerId));
    }

    private async registerScheduler() {
        try {
            await db.insert(schedulerMetadata).values({
                id: this.schedulerId,
                status: 'ACTIVE',
                jobsProcessedCount: 0,
                metadata: {
                    startTime: new Date().toISOString(),
                    pid: process.pid,
                },
            });

            schedulerLogger.info('Scheduler registered', { schedulerId: this.schedulerId });
        } catch (error) {
            schedulerLogger.error('Failed to register scheduler', {
                schedulerId: this.schedulerId,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    private startHeartbeat() {
        setInterval(async () => {
            if (!this.isRunning) return;

            try {
                await db.update(schedulerMetadata)
                    .set({
                        lastHeartbeat: new Date(),
                        jobsProcessedCount: this.jobsProcessed,
                        updatedAt: new Date(),
                    })
                    .where(eq(schedulerMetadata.id, this.schedulerId));

                schedulerLogger.debug('Heartbeat sent', {
                    schedulerId: this.schedulerId,
                    jobsProcessed: this.jobsProcessed,
                });
            } catch (error) {
                schedulerLogger.error('Failed to send heartbeat', {
                    schedulerId: this.schedulerId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }, this.heartbeatInterval);
    }

    private startJobPicker() {
        setInterval(async () => {
            if (!this.isRunning) return;

            try {
                await this.pickAndScheduleJobs();
            } catch (error) {
                schedulerLogger.error('Error in job picker', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }, this.checkInterval);

        // Run immediately
        this.pickAndScheduleJobs();
    }

    private async pickAndScheduleJobs() {
        try {
            // Get all active jobs
            const activeJobs = await db.select()
                .from(jobs)
                .where(eq(jobs.status, 'ACTIVE'));

            const now = new Date();

            for (const job of activeJobs) {
                try {
                    // Parse cron expression
                    const interval = CronExpressionParser.parse(job.schedule);
                    const nextRun = interval.next().toDate();

                    // Check if job should run now (within check interval)
                    if (nextRun.getTime() <= now.getTime() + this.checkInterval) {
                        // Check if there's already a pending execution for this time
                        const existingExecution = await db.select()
                            .from(jobExecutions)
                            .where(
                                and(
                                    eq(jobExecutions.jobId, job.id),
                                    eq(jobExecutions.scheduledAt, nextRun),
                                    eq(jobExecutions.status, 'PENDING')
                                )
                            )
                            .limit(1);

                        if (existingExecution.length === 0) {
                            // Create execution
                            const [execution] = await db.insert(jobExecutions).values({
                                jobId: job.id,
                                scheduledAt: nextRun,
                                status: 'PENDING',
                            }).returning();

                            schedulerLogger.info('Job scheduled for execution', {
                                jobId: job.id,
                                executionId: execution.id,
                                scheduledAt: nextRun,
                            });

                            // Execute job immediately
                            this.executeJobAsync(
                                execution.id,
                                job.id,
                                job.apiEndpoint,
                                job.timeoutMs || 30000,
                                job.retryPolicy as any
                            );
                        }
                    }
                } catch (error) {
                    schedulerLogger.error('Error scheduling job', {
                        jobId: job.id,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                }
            }
        } catch (error) {
            schedulerLogger.error('Error picking jobs', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    private async executeJobAsync(
        executionId: string,
        jobId: string,
        apiEndpoint: string,
        timeoutMs: number,
        retryPolicy?: any
    ) {
        // Execute in background
        this.jobExecutor.executeJob(executionId, jobId, apiEndpoint, timeoutMs, retryPolicy)
            .then(() => {
                this.jobsProcessed++;
                schedulerLogger.debug('Job execution completed', { executionId, jobId });
            })
            .catch((error) => {
                schedulerLogger.error('Job execution failed', {
                    executionId,
                    jobId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            });
    }

    getStatus() {
        return {
            instanceId: this.schedulerId,
            status: this.isRunning ? 'ACTIVE' : 'INACTIVE',
            jobsProcessedCount: this.jobsProcessed,
            uptime: process.uptime() * 1000,
        };
    }
}
