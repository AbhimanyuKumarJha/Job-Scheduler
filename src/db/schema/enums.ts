import { pgEnum } from 'drizzle-orm/pg-core';

// Database enums
export const executionTypeEnum = pgEnum('execution_type', ['ATLEAST_ONCE']);
export const jobStatusEnum = pgEnum('job_status', ['ACTIVE', 'PAUSED', 'DELETED']);
export const executionStatusEnum = pgEnum('execution_status', ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'RETRYING']);
export const logLevelEnum = pgEnum('log_level', ['INFO', 'WARN', 'ERROR', 'DEBUG']);
export const schedulerStatusEnum = pgEnum('scheduler_status', ['ACTIVE', 'INACTIVE']);
export const alertTypeEnum = pgEnum('alert_type', ['WEBHOOK', 'EMAIL', 'SLACK']);
