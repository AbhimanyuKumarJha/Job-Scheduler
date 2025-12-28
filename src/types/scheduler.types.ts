import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { schedulerMetadata } from '../db/schema';

// Scheduler metadata types
export type SchedulerMetadata = InferSelectModel<typeof schedulerMetadata>;
export type NewSchedulerMetadata = InferInsertModel<typeof schedulerMetadata>;
