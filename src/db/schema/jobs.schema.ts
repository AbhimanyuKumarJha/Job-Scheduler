import { pgTable, uuid, varchar, timestamp, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { executionTypeEnum, jobStatusEnum } from './enums';

// Jobs table
export const jobs = pgTable('jobs', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }),
    schedule: varchar('schedule', { length: 100 }).notNull(),
    apiEndpoint: varchar('api_endpoint', { length: 500 }).notNull(),
    executionType: executionTypeEnum('execution_type').notNull().default('ATLEAST_ONCE'),
    status: jobStatusEnum('status').notNull().default('ACTIVE'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdBy: varchar('created_by', { length: 255 }),
    metadata: jsonb('metadata'),
    timeoutMs: integer('timeout_ms').default(30000),
    retryPolicy: jsonb('retry_policy'),
    maxConcurrentExecutions: integer('max_concurrent_executions').default(1),
    rateLimitPerMinute: integer('rate_limit_per_minute'),
}, (table) => ({
    statusIdx: index('jobs_status_idx').on(table.status),
}));
