import { z } from 'zod';

// Common reusable schemas
export const cronExpressionSchema = z.string().regex(
    /^(\*|[0-5]?\d) (\*|[0-5]?\d) (\*|[01]?\d|2[0-3]) (\*|[1-9]|[12]\d|3[01]) (\*|[1-9]|1[0-2]) (\*|[0-6])$/,
    'Invalid cron expression format'
);

export const urlSchema = z.string().url();

export const retryPolicySchema = z.object({
    maxRetries: z.number().int().min(0).max(10),
    backoffStrategy: z.enum(['EXPONENTIAL', 'LINEAR', 'FIXED']),
    initialDelayMs: z.number().int().positive(),
    maxDelayMs: z.number().int().positive(),
});

export const paginationSchema = z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
});

export const sortOrderSchema = z.enum(['asc', 'desc']);
