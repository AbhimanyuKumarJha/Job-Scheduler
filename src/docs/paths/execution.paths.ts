import { OpenAPIV3 } from 'openapi-types';

export const executionPaths: OpenAPIV3.PathsObject = {
    '/api/v1/jobs/{id}/executions': {
        get: {
            tags: ['Executions'],
            summary: 'Get job executions',
            description: 'Retrieve execution history for a specific job',
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
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Maximum number of executions to return',
                    schema: {
                        type: 'integer',
                        default: 5,
                        minimum: 1,
                        maximum: 100,
                    },
                },
                {
                    name: 'status',
                    in: 'query',
                    description: 'Filter by execution status',
                    schema: {
                        type: 'string',
                        enum: ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'RETRYING'],
                    },
                },
            ],
            responses: {
                '200': {
                    description: 'Successful response',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ExecutionListResponse',
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
    '/api/v1/executions/{id}': {
        get: {
            tags: ['Executions'],
            summary: 'Get execution details',
            description: 'Retrieve detailed information about a specific execution including logs',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'Execution UUID',
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
                                $ref: '#/components/schemas/ExecutionWithLogsResponse',
                            },
                        },
                    },
                },
                '404': {
                    description: 'Execution not found',
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
