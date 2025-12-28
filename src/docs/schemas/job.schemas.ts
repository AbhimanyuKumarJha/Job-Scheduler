import { OpenAPIV3 } from 'openapi-types';

export const jobSchemas: Record<string, OpenAPIV3.SchemaObject> = {
    Job: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                format: 'uuid',
                example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
                type: 'string',
                nullable: true,
                example: 'Daily Report Generation',
            },
            schedule: {
                type: 'string',
                description: 'Cron expression (second minute hour day month weekday)',
                example: '0 0 9 * * *',
            },
            apiEndpoint: {
                type: 'string',
                format: 'uri',
                example: 'https://api.example.com/generate-report',
            },
            executionType: {
                type: 'string',
                enum: ['ATLEAST_ONCE'],
                example: 'ATLEAST_ONCE',
            },
            status: {
                type: 'string',
                enum: ['ACTIVE', 'PAUSED', 'DELETED'],
                example: 'ACTIVE',
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
            },
            createdBy: {
                type: 'string',
                nullable: true,
            },
            metadata: {
                type: 'object',
                additionalProperties: true,
                nullable: true,
            },
            timeoutMs: {
                type: 'integer',
                nullable: true,
                example: 30000,
            },
            retryPolicy: {
                nullable: true,
                oneOf: [
                    { $ref: '#/components/schemas/RetryPolicy' },
                ],
            },
            maxConcurrentExecutions: {
                type: 'integer',
                nullable: true,
                example: 1,
            },
            rateLimitPerMinute: {
                type: 'integer',
                nullable: true,
            },
        },
    },
    CreateJobRequest: {
        type: 'object',
        required: ['schedule', 'api'],
        properties: {
            name: {
                type: 'string',
                example: 'Daily Report Generation',
            },
            schedule: {
                type: 'string',
                description: 'Cron expression (second minute hour day month weekday)',
                example: '0 0 9 * * *',
            },
            api: {
                type: 'string',
                format: 'uri',
                example: 'https://api.example.com/generate-report',
            },
            type: {
                type: 'string',
                enum: ['ATLEAST_ONCE'],
                default: 'ATLEAST_ONCE',
            },
            metadata: {
                type: 'object',
                additionalProperties: true,
            },
            timeoutMs: {
                type: 'integer',
                example: 30000,
            },
            retryPolicy: {
                $ref: '#/components/schemas/RetryPolicy',
            },
            maxConcurrentExecutions: {
                type: 'integer',
                example: 1,
            },
            rateLimitPerMinute: {
                type: 'integer',
            },
        },
    },
    UpdateJobRequest: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
            },
            schedule: {
                type: 'string',
            },
            api: {
                type: 'string',
                format: 'uri',
            },
            status: {
                type: 'string',
                enum: ['ACTIVE', 'PAUSED', 'DELETED'],
            },
            metadata: {
                type: 'object',
                additionalProperties: true,
            },
            timeoutMs: {
                type: 'integer',
            },
            retryPolicy: {
                $ref: '#/components/schemas/RetryPolicy',
            },
            maxConcurrentExecutions: {
                type: 'integer',
            },
            rateLimitPerMinute: {
                type: 'integer',
            },
        },
    },
    JobListResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true,
            },
            data: {
                type: 'object',
                properties: {
                    jobs: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Job',
                        },
                    },
                    pagination: {
                        $ref: '#/components/schemas/Pagination',
                    },
                },
            },
        },
    },
    JobResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true,
            },
            data: {
                $ref: '#/components/schemas/Job',
            },
        },
    },
};
