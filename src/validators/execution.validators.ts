import { z } from 'zod';

// Execution query schema
export const executionQuerySchema = z.object({
    limit: z.string().optional().transform(val => val ? parseInt(val) : 5),
    status: z.enum(['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'RETRYING']).optional(),
});

// Type inference
export type ExecutionQuery = z.infer<typeof executionQuerySchema>;
