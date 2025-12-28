import axios, { AxiosError } from 'axios';
import { db } from '../config/database';
import { jobExecutions, jobExecutionLogs, failedJobsDLQ } from '../db/schema';
import { eq } from 'drizzle-orm';
import { executionLogger } from '../config/logger';

interface RetryPolicy {
    maxRetries: number;
    backoffStrategy: 'EXPONENTIAL' | 'LINEAR' | 'FIXED';
    initialDelayMs: number;
    maxDelayMs: number;
}

export class JobExecutor {
    private calculateRetryDelay(retryCount: number, policy: RetryPolicy): number {
        let delay = policy.initialDelayMs;

        switch (policy.backoffStrategy) {
            case 'EXPONENTIAL':
                delay = policy.initialDelayMs * Math.pow(2, retryCount);
                break;
            case 'LINEAR':
                delay = policy.initialDelayMs * (retryCount + 1);
                break;
            case 'FIXED':
                delay = policy.initialDelayMs;
                break;
        }

        return Math.min(delay, policy.maxDelayMs);
    }

    async executeJob(executionId: string, jobId: string, apiEndpoint: string, timeoutMs: number = 30000, retryPolicy?: RetryPolicy) {
        const startTime = Date.now();

        try {
            executionLogger.info('Starting job execution', { executionId, jobId, apiEndpoint });

            // Update execution status to RUNNING
            await db.update(jobExecutions)
                .set({
                    status: 'RUNNING',
                    startedAt: new Date(),
                })
                .where(eq(jobExecutions.id, executionId));

            // Log execution start
            await db.insert(jobExecutionLogs).values({
                executionId,
                logLevel: 'INFO',
                message: 'Job execution started',
                metadata: { apiEndpoint, timeoutMs },
            });

            // Make HTTP request
            const response = await axios.get(apiEndpoint, {
                timeout: timeoutMs,
                validateStatus: () => true, // Accept all status codes
            });

            const duration = Date.now() - startTime;
            const isSuccess = response.status >= 200 && response.status < 300;

            executionLogger.info('Job execution completed', {
                executionId,
                jobId,
                statusCode: response.status,
                duration: `${duration}ms`,
                success: isSuccess,
            });

            // Update execution with result
            await db.update(jobExecutions)
                .set({
                    status: isSuccess ? 'SUCCESS' : 'FAILED',
                    completedAt: new Date(),
                    httpStatusCode: response.status,
                    responseBody: JSON.stringify(response.data).substring(0, 5000), // Limit size
                    executionDurationMs: duration,
                    errorMessage: isSuccess ? null : `HTTP ${response.status}: ${response.statusText}`,
                })
                .where(eq(jobExecutions.id, executionId));

            // Log execution result
            await db.insert(jobExecutionLogs).values({
                executionId,
                logLevel: isSuccess ? 'INFO' : 'ERROR',
                message: isSuccess ? 'Job execution successful' : 'Job execution failed',
                metadata: {
                    statusCode: response.status,
                    duration,
                },
            });

            // If failed and retries available, schedule retry
            if (!isSuccess && retryPolicy) {
                const [execution] = await db.select()
                    .from(jobExecutions)
                    .where(eq(jobExecutions.id, executionId))
                    .limit(1);

                if ((execution.retryCount || 0) < retryPolicy.maxRetries) {
                    await this.scheduleRetry(executionId, jobId, apiEndpoint, (execution.retryCount || 0) + 1, retryPolicy, timeoutMs);
                } else {
                    // Move to DLQ
                    await db.insert(failedJobsDLQ).values({
                        jobId,
                        executionId,
                        errorDetails: {
                            statusCode: response.status,
                            message: response.statusText,
                            retryPolicy,
                        },
                        retryAttempts: execution.retryCount || 0,
                    });

                    executionLogger.error('Job moved to DLQ after max retries', {
                        executionId,
                        jobId,
                        retries: execution.retryCount,
                    });
                }
            }

            return { success: isSuccess, statusCode: response.status, duration };
        } catch (error) {
            const duration = Date.now() - startTime;
            const errorMessage = error instanceof AxiosError
                ? `${error.message}: ${error.code}`
                : error instanceof Error ? error.message : 'Unknown error';

            executionLogger.error('Job execution failed with error', {
                executionId,
                jobId,
                error: errorMessage,
                duration: `${duration}ms`,
            });

            // Update execution with error
            await db.update(jobExecutions)
                .set({
                    status: 'FAILED',
                    completedAt: new Date(),
                    errorMessage,
                    executionDurationMs: duration,
                })
                .where(eq(jobExecutions.id, executionId));

            // Log error
            await db.insert(jobExecutionLogs).values({
                executionId,
                logLevel: 'ERROR',
                message: 'Job execution failed with exception',
                metadata: {
                    error: errorMessage,
                    duration,
                },
            });

            // Handle retry if policy exists
            if (retryPolicy) {
                const [execution] = await db.select()
                    .from(jobExecutions)
                    .where(eq(jobExecutions.id, executionId))
                    .limit(1);

                if ((execution.retryCount || 0) < retryPolicy.maxRetries) {
                    await this.scheduleRetry(executionId, jobId, apiEndpoint, (execution.retryCount || 0) + 1, retryPolicy, timeoutMs);
                } else {
                    // Move to DLQ
                    await db.insert(failedJobsDLQ).values({
                        jobId,
                        executionId,
                        errorDetails: {
                            error: errorMessage,
                            retryPolicy,
                        },
                        retryAttempts: execution.retryCount || 0,
                    });

                    executionLogger.error('Job moved to DLQ after max retries', {
                        executionId,
                        jobId,
                        retries: execution.retryCount,
                    });
                }
            }

            throw error;
        }
    }

    private async scheduleRetry(
        executionId: string,
        jobId: string,
        apiEndpoint: string,
        retryCount: number,
        retryPolicy: RetryPolicy,
        timeoutMs: number
    ) {
        const delay = this.calculateRetryDelay(retryCount - 1, retryPolicy);

        executionLogger.info('Scheduling retry', {
            executionId,
            jobId,
            retryCount,
            delayMs: delay,
        });

        // Update retry count
        await db.update(jobExecutions)
            .set({
                status: 'RETRYING',
                retryCount,
            })
            .where(eq(jobExecutions.id, executionId));

        // Log retry
        await db.insert(jobExecutionLogs).values({
            executionId,
            logLevel: 'WARN',
            message: `Scheduling retry attempt ${retryCount}`,
            metadata: { delayMs: delay },
        });

        // Schedule retry
        setTimeout(() => {
            this.executeJob(executionId, jobId, apiEndpoint, timeoutMs, retryPolicy);
        }, delay);
    }
}
