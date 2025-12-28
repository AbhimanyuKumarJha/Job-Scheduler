import { OpenAPIV3 } from 'openapi-types';

export const executionSchemas: Record<string, OpenAPIV3.SchemaObject> = {
    Execution: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                format: 'uuid',
            },
            jobId: {
                type: 'string',
                format: 'uuid',
            },
            scheduledAt: {
                type: 'string',
                format: 'date-time',
            },
            startedAt: {
                type: 'string',
                format: 'date-time',
                nullable: true,
            },
            completedAt: {
                type: 'string',
                format: 'date-time',
                nullable: true,
            },
            status: {
                type: 'string',
                enum: ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'RETRYING'],
            },
            httpStatusCode: {
                type: 'integer',
                nullable: true,
            },
            responseBody: {
                type: 'string',
                nullable: true,
            },
            errorMessage: {
                type: 'string',
                nullable: true,
            },
            executionDurationMs: {
                type: 'integer',
                nullable: true,
            },
            retryCount: {
                type: 'integer',
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
            },
        },
    },
    ExecutionLog: {
        type: 'object',
        properties: {
            id: {
                type: 'integer',
            },
            executionId: {
                type: 'string',
                format: 'uuid',
            },
            logLevel: {
                type: 'string',
                enum: ['INFO', 'WARN', 'ERROR', 'DEBUG'],
            },
            message: {
                type: 'string',
            },
            timestamp: {
                type: 'string',
                format: 'date-time',
            },
            metadata: {
                type: 'object',
                additionalProperties: true,
                nullable: true,
            },
        },
    },
    ExecutionListResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true,
            },
            data: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/Execution',
                },
            },
        },
    },
    ExecutionWithLogsResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true,
            },
            data: {
                allOf: [
                    { $ref: '#/components/schemas/Execution' },
                    {
                        type: 'object',
                        properties: {
                            logs: {
                                type: 'array',
                                items: {
                                    $ref: '#/components/schemas/ExecutionLog',
                                },
                            },
                        },
                    },
                ],
            },
        },
    },
};
