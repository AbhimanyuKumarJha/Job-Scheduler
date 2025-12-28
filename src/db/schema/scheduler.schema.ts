import { pgTable, varchar, timestamp, bigint, jsonb } from 'drizzle-orm/pg-core';
import { schedulerStatusEnum } from './enums';

// Scheduler metadata table
export const schedulerMetadata = pgTable('scheduler_metadata', {
    id: varchar('id', { length: 100 }).primaryKey(),
    lastHeartbeat: timestamp('last_heartbeat').defaultNow().notNull(),
    status: schedulerStatusEnum('status').notNull().default('ACTIVE'),
    jobsProcessedCount: bigint('jobs_processed_count', { mode: 'number' }).default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    metadata: jsonb('metadata'),
});
