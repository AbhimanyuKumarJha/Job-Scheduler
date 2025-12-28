import { OpenAPIV3 } from 'openapi-types';

export const commonSchemas: Record<string, OpenAPIV3.SchemaObject> = {
    Error: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: false,
            },
            error: {
                type: 'string',
                example: 'Error message',
            },
        },
        required: ['success', 'error'],
    },
    Pagination: {
        type: 'object',
        properties: {
            page: {
                type: 'integer',
                example: 1,
            },
            limit: {
                type: 'integer',
                example: 20,
            },
            total: {
                type: 'integer',
                example: 100,
            },
            totalPages: {
                type: 'integer',
                example: 5,
            },
        },
    },
    RetryPolicy: {
        type: 'object',
        properties: {
            maxRetries: {
                type: 'integer',
                minimum: 0,
                maximum: 10,
                example: 3,
            },
            backoffStrategy: {
                type: 'string',
                enum: ['EXPONENTIAL', 'LINEAR', 'FIXED'],
                example: 'EXPONENTIAL',
            },
            initialDelayMs: {
                type: 'integer',
                example: 1000,
            },
            maxDelayMs: {
                type: 'integer',
                example: 30000,
            },
        },
        required: ['maxRetries', 'backoffStrategy', 'initialDelayMs', 'maxDelayMs'],
    },
};
