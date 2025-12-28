import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { jobAlerts } from '../db/schema';

// Job alert types
export type JobAlert = InferSelectModel<typeof jobAlerts>;
export type NewJobAlert = InferInsertModel<typeof jobAlerts>;

// Alert conditions type
export interface AlertConditions {
    onFailure?: boolean;
    onSuccess?: boolean;
    consecutiveFailures?: number;
}
