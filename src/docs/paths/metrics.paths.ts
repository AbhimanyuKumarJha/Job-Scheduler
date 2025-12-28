import { OpenAPIV3 } from 'openapi-types';

export const metricsPaths: OpenAPIV3.PathsObject = {
    '/api/v1/metrics': {
        get: {
            tags: ['Metrics'],
            summary: 'Get system metrics',
            description: 'Retrieve comprehensive system metrics including job counts, execution statistics, and system health',
            responses: {
                '200': {
                    description: 'Successful response',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: {
                                        type: 'boolean',
                                        example: true,
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            totalJobs: {
                                                type: 'integer',
                                                example: 50,
                                            },
                                            activeJobs: {
                                                type: 'integer',
                                                example: 45,
                                            },
                                            pausedJobs: {
                                                type: 'integer',
                                                example: 3,
                                            },
                                            deletedJobs: {
                                                type: 'integer',
                                                example: 2,
                                            },
                                            totalExecutions: {
                                                type: 'integer',
                                                example: 1250,
                                            },
                                            successfulExecutions: {
                                                type: 'integer',
                                                example: 1180,
                                            },
                                            failedExecutions: {
                                                type: 'integer',
                                                example: 70,
                                            },
                                            successRate: {
                                                type: 'string',
                                                example: '94.40%',
                                            },
                                            avgExecutionTime: {
                                                type: 'string',
                                                example: '1523ms',
                                            },
                                            schedulerStatus: {
                                                type: 'string',
                                                example: 'ACTIVE',
                                            },
                                            lastHeartbeat: {
                                                type: 'string',
                                                format: 'date-time',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
