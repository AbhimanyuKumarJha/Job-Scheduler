import { Job } from './job.types';
import { JobExecution, JobExecutionLog } from './execution.types';

// Extended types with additional computed properties
export interface JobWithNextRun extends Job {
    nextScheduledRun: Date | null;
}

export interface ExecutionWithLogs extends JobExecution {
    logs: JobExecutionLog[];
}
