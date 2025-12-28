import { z } from 'zod';
import { cronExpressionSchema, urlSchema, retryPolicySchema, sortOrderSchema } from './common.validators';

// Create job schema
export const createJobSchema = z.object({
    name: z.string().optional(),
    schedule: cronExpressionSchema,
    api: urlSchema,
    type: z.enum(['ATLEAST_ONCE']).default('ATLEAST_ONCE'),
    metadata: z.record(z.string(), z.any()).optional(),
    timeoutMs: z.number().int().positive().optional(),
    retryPolicy: retryPolicySchema.optional(),
    maxConcurrentExecutions: z.number().int().positive().optional(),
    rateLimitPerMinute: z.number().int().positive().optional(),
});

// Update job schema
export const updateJobSchema = z.object({
    name: z.string().optional(),
    schedule: cronExpressionSchema.optional(),
    api: urlSchema.optional(),
    status: z.enum(['ACTIVE', 'PAUSED', 'DELETED']).optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    timeoutMs: z.number().int().positive().optional(),
    retryPolicy: retryPolicySchema.optional(),
    maxConcurrentExecutions: z.number().int().positive().optional(),
    rateLimitPerMinute: z.number().int().positive().optional(),
});

// Job query schema
export const jobQuerySchema = z.object({
    status: z.enum(['ACTIVE', 'PAUSED', 'DELETED']).optional(),
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
    sortBy: z.enum(['createdAt', 'updatedAt']).optional().default('createdAt'),
    order: sortOrderSchema.optional().default('desc'),
});

// Type inference
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type JobQuery = z.infer<typeof jobQuerySchema>;
