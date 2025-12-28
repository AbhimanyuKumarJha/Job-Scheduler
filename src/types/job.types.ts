import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { jobs } from '../db/schema';

// Job types
export type Job = InferSelectModel<typeof jobs>;
export type NewJob = InferInsertModel<typeof jobs>;
