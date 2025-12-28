import { pgTable, uuid, varchar, timestamp, integer, jsonb, bigserial, index } from 'drizzle-orm/pg-core';
import { jobStatusEnum } from './enums';
import { jobs } from './jobs.schema';

// Job audit log table
export const jobAuditLog = pgTable('job_audit_log', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
    action: varchar('action', { length: 50 }).notNull(),
    changedBy: varchar('changed_by', { length: 255 }),
    changeDetails: jsonb('change_details'),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (table) => ({
    jobIdIdx: index('job_audit_log_job_id_idx').on(table.jobId),
    timestampIdx: index('job_audit_log_timestamp_idx').on(table.timestamp),
}));

// Dead letter queue table
export const failedJobsDLQ = pgTable('failed_jobs_dlq', {
    id: uuid('id').primaryKey().defaultRandom(),
    executionId: uuid('execution_id').notNull(),
    jobId: uuid('job_id').notNull(),
    failedAt: timestamp('failed_at').defaultNow().notNull(),
    errorDetails: jsonb('error_details').notNull(),
    retryAttempts: integer('retry_attempts').notNull(),
    resolved: jobStatusEnum('resolved').notNull().default('ACTIVE'),
    resolvedAt: timestamp('resolved_at'),
    resolvedBy: varchar('resolved_by', { length: 255 }),
}, (table) => ({
    jobIdIdx: index('failed_jobs_dlq_job_id_idx').on(table.jobId),
    resolvedIdx: index('failed_jobs_dlq_resolved_idx').on(table.resolved),
}));
