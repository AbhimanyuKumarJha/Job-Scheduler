// Enum types
export type ExecutionType = 'ATLEAST_ONCE';
export type JobStatus = 'ACTIVE' | 'PAUSED' | 'DELETED';
export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'RETRYING';
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
export type SchedulerStatus = 'ACTIVE' | 'INACTIVE';
export type AlertType = 'WEBHOOK' | 'EMAIL' | 'SLACK';
