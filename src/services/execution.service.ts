import { db } from '../config/database';
import { jobExecutions, jobExecutionLogs, jobs } from '../db/schema';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import { createLogger } from '../config/logger';

const serviceLogger = createLogger('ExecutionService');

export class ExecutionService {
    async getExecutionById(executionId: string) {
        try {
            const [execution] = await db
                .select()
                .from(jobExecutions)
                .where(eq(jobExecutions.id, executionId))
                .limit(1);

            if (!execution) {
                throw new Error('Execution not found');
            }

            // Get associated logs
            const logs = await db
                .select()
                .from(jobExecutionLogs)
                .where(eq(jobExecutionLogs.executionId, executionId))
                .orderBy(jobExecutionLogs.timestamp);

            return { ...execution, logs };
        } catch (error) {
            serviceLogger.error('Failed to get execution', {
                executionId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }

    async getSystemMetrics() {
        try {
            const [
                [{ totalJobs }],
                [{ activeJobs }],
                [{ pausedJobs }],
                [{ totalExecutions }],
                [{ successfulExecutions }],
                [{ executionsLast24h }],
                [{ failedExecutionsLast24h }],
                [{ pendingExecutions }],
                [{ runningExecutions }],
                [{ avgExecutionTime }],
            ] = await Promise.all([
                db.select({ totalJobs: sql<number>`count(*)::int` }).from(jobs),
                db.select({ activeJobs: sql<number>`count(*)::int` }).from(jobs).where(eq(jobs.status, 'ACTIVE')),
                db.select({ pausedJobs: sql<number>`count(*)::int` }).from(jobs).where(eq(jobs.status, 'PAUSED')),
                db.select({ totalExecutions: sql<number>`count(*)::int` }).from(jobExecutions),
                db.select({ successfulExecutions: sql<number>`count(*)::int` }).from(jobExecutions).where(eq(jobExecutions.status, 'SUCCESS')),
                db.select({ executionsLast24h: sql<number>`count(*)::int` }).from(jobExecutions)
                    .where(gte(jobExecutions.scheduledAt, new Date(Date.now() - 24 * 60 * 60 * 1000))),
                db.select({ failedExecutionsLast24h: sql<number>`count(*)::int` }).from(jobExecutions)
                    .where(and(
                        eq(jobExecutions.status, 'FAILED'),
                        gte(jobExecutions.scheduledAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
                    )),
                db.select({ pendingExecutions: sql<number>`count(*)::int` }).from(jobExecutions).where(eq(jobExecutions.status, 'PENDING')),
                db.select({ runningExecutions: sql<number>`count(*)::int` }).from(jobExecutions).where(eq(jobExecutions.status, 'RUNNING')),
                db.select({ avgExecutionTime: sql<number>`avg(execution_duration_ms)::int` }).from(jobExecutions)
                    .where(eq(jobExecutions.status, 'SUCCESS')),
            ]);

            const successRate = totalExecutions > 0
                ? ((successfulExecutions / totalExecutions) * 100).toFixed(2)
                : 0;

            return {
                totalJobs,
                activeJobs,
                pausedJobs,
                totalExecutions,
                successRate: parseFloat(successRate.toString()),
                avgExecutionTimeMs: avgExecutionTime || 0,
                executionsLast24h,
                failedExecutionsLast24h,
                currentLoad: {
                    pendingExecutions,
                    runningExecutions,
                },
            };
        } catch (error) {
            serviceLogger.error('Failed to get system metrics', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }

    async getJobMetrics(jobId: string) {
        try {
            const [
                [{ totalExecutions }],
                [{ successfulExecutions }],
                [{ failedExecutions }],
                [{ avgExecutionTime }],
                lastExecution,
            ] = await Promise.all([
                db.select({ totalExecutions: sql<number>`count(*)::int` })
                    .from(jobExecutions)
                    .where(eq(jobExecutions.jobId, jobId)),
                db.select({ successfulExecutions: sql<number>`count(*)::int` })
                    .from(jobExecutions)
                    .where(and(eq(jobExecutions.jobId, jobId), eq(jobExecutions.status, 'SUCCESS'))),
                db.select({ failedExecutions: sql<number>`count(*)::int` })
                    .from(jobExecutions)
                    .where(and(eq(jobExecutions.jobId, jobId), eq(jobExecutions.status, 'FAILED'))),
                db.select({ avgExecutionTime: sql<number>`avg(execution_duration_ms)::int` })
                    .from(jobExecutions)
                    .where(and(eq(jobExecutions.jobId, jobId), eq(jobExecutions.status, 'SUCCESS'))),
                db.select()
                    .from(jobExecutions)
                    .where(eq(jobExecutions.jobId, jobId))
                    .orderBy(desc(jobExecutions.scheduledAt))
                    .limit(1),
            ]);

            const successRate = totalExecutions > 0
                ? ((successfulExecutions / totalExecutions) * 100).toFixed(2)
                : 0;

            // Calculate average delay
            const [{ avgDelay }] = await db.select({
                avgDelay: sql<number>`avg(EXTRACT(EPOCH FROM (started_at - scheduled_at)) * 1000)::int`,
            })
                .from(jobExecutions)
                .where(and(
                    eq(jobExecutions.jobId, jobId),
                    sql`started_at IS NOT NULL`
                ));

            return {
                jobId,
                totalExecutions,
                successfulExecutions,
                failedExecutions,
                successRate: parseFloat(successRate.toString()),
                avgExecutionTimeMs: avgExecutionTime || 0,
                lastExecutionStatus: lastExecution[0]?.status || null,
                lastExecutionAt: lastExecution[0]?.scheduledAt || null,
                avgDelayFromScheduleMs: avgDelay || 0,
            };
        } catch (error) {
            serviceLogger.error('Failed to get job metrics', {
                jobId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
}
