import { z } from 'zod';
import { urlSchema } from './common.validators';

// Create alert schema
export const createAlertSchema = z.object({
    type: z.enum(['WEBHOOK', 'EMAIL', 'SLACK']),
    endpoint: urlSchema,
    conditions: z.object({
        onFailure: z.boolean().optional(),
        onSuccess: z.boolean().optional(),
        consecutiveFailures: z.number().int().positive().optional(),
    }),
});

// Type inference
export type CreateAlertInput = z.infer<typeof createAlertSchema>;
