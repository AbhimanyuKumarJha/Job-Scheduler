import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { jobExecutions, jobExecutionLogs } from '../db/schema';

// Job execution types
export type JobExecution = InferSelectModel<typeof jobExecutions>;
export type NewJobExecution = InferInsertModel<typeof jobExecutions>;

// Job execution log types
export type JobExecutionLog = InferSelectModel<typeof jobExecutionLogs>;
export type NewJobExecutionLog = InferInsertModel<typeof jobExecutionLogs>;
