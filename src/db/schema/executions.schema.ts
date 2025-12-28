import { pgTable, uuid, text, timestamp, integer, bigserial, index } from 'drizzle-orm/pg-core';
import { executionStatusEnum, logLevelEnum } from './enums';
import { jobs } from './jobs.schema';
import { jsonb } from 'drizzle-orm/pg-core';

// Job executions table
export const jobExecutions = pgTable('job_executions', {
    id: uuid('id').primaryKey().defaultRandom(),
    jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
    scheduledAt: timestamp('scheduled_at').notNull(),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    status: executionStatusEnum('status').notNull().default('PENDING'),
    httpStatusCode: integer('http_status_code'),
    responseBody: text('response_body'),
    errorMessage: text('error_message'),
    executionDurationMs: integer('execution_duration_ms'),
    retryCount: integer('retry_count').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    jobIdIdx: index('job_executions_job_id_idx').on(table.jobId),
    statusIdx: index('job_executions_status_idx').on(table.status),
    scheduledAtIdx: index('job_executions_scheduled_at_idx').on(table.scheduledAt),
    completedAtIdx: index('job_executions_completed_at_idx').on(table.completedAt),
}));

// Job execution logs table
export const jobExecutionLogs = pgTable('job_execution_logs', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    executionId: uuid('execution_id').notNull().references(() => jobExecutions.id, { onDelete: 'cascade' }),
    logLevel: logLevelEnum('log_level').notNull(),
    message: text('message').notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    metadata: jsonb('metadata'),
}, (table) => ({
    executionIdIdx: index('job_execution_logs_execution_id_idx').on(table.executionId),
}));
