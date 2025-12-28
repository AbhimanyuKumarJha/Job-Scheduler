import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { jobTags } from '../db/schema';

// Job tag types
export type JobTag = InferSelectModel<typeof jobTags>;
export type NewJobTag = InferInsertModel<typeof jobTags>;
