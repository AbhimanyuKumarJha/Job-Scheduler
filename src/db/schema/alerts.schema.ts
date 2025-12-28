import { pgTable, uuid, varchar, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { alertTypeEnum, jobStatusEnum } from './enums';
import { jobs } from './jobs.schema';

// Job alerts table
export const jobAlerts = pgTable('job_alerts', {
    id: uuid('id').primaryKey().defaultRandom(),
    jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
    type: alertTypeEnum('type').notNull(),
    endpoint: varchar('endpoint', { length: 500 }).notNull(),
    conditions: jsonb('conditions').notNull(),
    enabled: jobStatusEnum('enabled').notNull().default('ACTIVE'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    jobIdIdx: index('job_alerts_job_id_idx').on(table.jobId),
}));
