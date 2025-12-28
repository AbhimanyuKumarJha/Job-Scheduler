import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { jobDependencies } from '../db/schema';

// Job dependency types
export type JobDependency = InferSelectModel<typeof jobDependencies>;
export type NewJobDependency = InferInsertModel<typeof jobDependencies>;
