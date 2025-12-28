import { relations } from 'drizzle-orm';
import { jobs } from './jobs.schema';
import { jobExecutions, jobExecutionLogs } from './executions.schema';
import { jobAlerts } from './alerts.schema';
import { jobTags, jobTagAssociations } from './tags.schema';
import { jobDependencies } from './dependencies.schema';
import { jobAuditLog } from './audit.schema';

// Job relations
export const jobsRelations = relations(jobs, ({ many }) => ({
    executions: many(jobExecutions),
    alerts: many(jobAlerts),
    tagAssociations: many(jobTagAssociations),
    dependencies: many(jobDependencies),
    auditLogs: many(jobAuditLog),
}));

// Job execution relations
export const jobExecutionsRelations = relations(jobExecutions, ({ one, many }) => ({
    job: one(jobs, {
        fields: [jobExecutions.jobId],
        references: [jobs.id],
    }),
    logs: many(jobExecutionLogs),
}));

// Job execution log relations
export const jobExecutionLogsRelations = relations(jobExecutionLogs, ({ one }) => ({
    execution: one(jobExecutions, {
        fields: [jobExecutionLogs.executionId],
        references: [jobExecutions.id],
    }),
}));

// Job alert relations
export const jobAlertsRelations = relations(jobAlerts, ({ one }) => ({
    job: one(jobs, {
        fields: [jobAlerts.jobId],
        references: [jobs.id],
    }),
}));

// Job tag association relations
export const jobTagAssociationsRelations = relations(jobTagAssociations, ({ one }) => ({
    job: one(jobs, {
        fields: [jobTagAssociations.jobId],
        references: [jobs.id],
    }),
    tag: one(jobTags, {
        fields: [jobTagAssociations.tagId],
        references: [jobTags.id],
    }),
}));

// Job dependency relations
export const jobDependenciesRelations = relations(jobDependencies, ({ one }) => ({
    job: one(jobs, {
        fields: [jobDependencies.jobId],
        references: [jobs.id],
    }),
    dependsOnJob: one(jobs, {
        fields: [jobDependencies.dependsOnJobId],
        references: [jobs.id],
    }),
}));
