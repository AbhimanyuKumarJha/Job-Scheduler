import { OpenAPIV3 } from 'openapi-types';

export const jobPaths: OpenAPIV3.PathsObject = {
    '/api/v1/jobs': {
        get: {
            tags: ['Jobs'],
            summary: 'List all jobs',
            description: 'Retrieve a paginated list of jobs with optional filtering',
            parameters: [
                {
                    name: 'status',
                    in: 'query',
                    description: 'Filter by job status',
                    schema: {
                        type: 'string',
                        enum: ['ACTIVE', 'PAUSED', 'DELETED'],
                    },
                },
                {
                    name: 'page',
                    in: 'query',
                    description: 'Page number',
                    schema: {
                        type: 'integer',
                        default: 1,
                    },
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Items per page',
                    schema: {
                        type: 'integer',
                        default: 20,
                        maximum: 100,
                    },
                },
                {
                    name: 'sortBy',
                    in: 'query',
                    description: 'Sort field',
                    schema: {
                        type: 'string',
                        enum: ['createdAt', 'updatedAt'],
                        default: 'createdAt',
                    },
                },
                {
                    name: 'order',
                    in: 'query',
                    description: 'Sort order',
                    schema: {
                        type: 'string',
                        enum: ['asc', 'desc'],
                        default: 'desc',
                    },
                },
            ],
            responses: {
                '200': {
                    description: 'Successful response',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/JobListResponse',
                            },
                        },
                    },
                },
                '400': {
                    description: 'Bad request',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
            },
        },
        post: {
            tags: ['Jobs'],
            summary: 'Create a new job',
            description: 'Create a new scheduled job with cron expression',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/CreateJobRequest',
                        },
                        examples: {
                            'daily-job': {
                                summary: 'Daily job at 9 AM',
                                value: {
                                    name: 'Daily Report',
                                    schedule: '0 0 9 * * *',
                                    api: 'https://api.example.com/daily-report',
                                    timeoutMs: 30000,
                                    retryPolicy: {
                                        maxRetries: 3,
                                        backoffStrategy: 'EXPONENTIAL',
                                        initialDelayMs: 1000,
                                        maxDelayMs: 30000,
                                    },
                                },
                            },
                            'every-30-seconds': {
                                summary: 'Job every 30 seconds',
                                value: {
                                    name: 'Health Check',
                                    schedule: '*/30 * * * * *',
                                    api: 'https://api.example.com/health',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                '201': {
                    description: 'Job created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/JobResponse',
                            },
                        },
                    },
                },
                '400': {
                    description: 'Invalid request',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/jobs/{id}': {
        get: {
            tags: ['Jobs'],
            summary: 'Get job by ID',
            description: 'Retrieve a specific job by its unique identifier',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'Job UUID',
                    schema: {
                        type: 'string',
                        format: 'uuid',
                    },
                },
            ],
            responses: {
                '200': {
                    description: 'Successful response',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/JobResponse',
                            },
                        },
                    },
                },
                '404': {
                    description: 'Job not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
            },
        },
        patch: {
            tags: ['Jobs'],
            summary: 'Update job',
            description: 'Update an existing job configuration',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'Job UUID',
                    schema: {
                        type: 'string',
                        format: 'uuid',
                    },
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UpdateJobRequest',
                        },
                    },
                },
            },
            responses: {
                '200': {
                    description: 'Job updated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/JobResponse',
                            },
                        },
                    },
                },
                '404': {
                    description: 'Job not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
            },
        },
        delete: {
            tags: ['Jobs'],
            summary: 'Delete job',
            description: 'Soft delete a job (sets status to DELETED)',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'Job UUID',
                    schema: {
                        type: 'string',
                        format: 'uuid',
                    },
                },
            ],
            responses: {
                '200': {
                    description: 'Job deleted successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: {
                                        type: 'boolean',
                                        example: true,
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'Job deleted successfully',
                                    },
                                },
                            },
                        },
                    },
                },
                '404': {
                    description: 'Job not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/jobs/{id}/pause': {
        post: {
            tags: ['Jobs'],
            summary: 'Pause job',
            description: 'Pause a job (sets status to PAUSED)',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'Job UUID',
                    schema: {
                        type: 'string',
                        format: 'uuid',
                    },
                },
            ],
            responses: {
                '200': {
                    description: 'Job paused successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/JobResponse',
                            },
                        },
                    },
                },
                '404': {
                    description: 'Job not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/jobs/{id}/resume': {
        post: {
            tags: ['Jobs'],
            summary: 'Resume job',
            description: 'Resume a paused job (sets status to ACTIVE)',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'Job UUID',
                    schema: {
                        type: 'string',
                        format: 'uuid',
                    },
                },
            ],
            responses: {
                '200': {
                    description: 'Job resumed successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/JobResponse',
                            },
                        },
                    },
                },
                '404': {
                    description: 'Job not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
            },
        },
    },
};
