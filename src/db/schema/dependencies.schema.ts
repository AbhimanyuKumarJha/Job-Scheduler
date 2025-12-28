import { pgTable, uuid, timestamp, index } from 'drizzle-orm/pg-core';
import { jobs } from './jobs.schema';

// Job dependencies table
export const jobDependencies = pgTable('job_dependencies', {
    id: uuid('id').primaryKey().defaultRandom(),
    jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
    dependsOnJobId: uuid('depends_on_job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    jobIdIdx: index('job_dependencies_job_id_idx').on(table.jobId),
    dependsOnIdx: index('job_dependencies_depends_on_idx').on(table.dependsOnJobId),
}));
