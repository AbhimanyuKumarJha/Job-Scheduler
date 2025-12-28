import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { jobs } from './jobs.schema';

// Job tags table
export const jobTags = pgTable('job_tags', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Job tag associations table
export const jobTagAssociations = pgTable('job_tag_associations', {
    jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id').notNull().references(() => jobTags.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    jobIdIdx: index('job_tag_associations_job_id_idx').on(table.jobId),
    tagIdIdx: index('job_tag_associations_tag_id_idx').on(table.tagId),
}));
