import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { jobAuditLog, failedJobsDLQ } from '../db/schema';

// Job audit log types
export type JobAuditLogEntry = InferSelectModel<typeof jobAuditLog>;
export type NewJobAuditLogEntry = InferInsertModel<typeof jobAuditLog>;

// Failed jobs DLQ types
export type FailedJobDLQ = InferSelectModel<typeof failedJobsDLQ>;
export type NewFailedJobDLQ = InferInsertModel<typeof failedJobsDLQ>;
