import { OpenAPIV3 } from 'openapi-types';

export const healthPaths: OpenAPIV3.PathsObject = {
    '/api/v1/health': {
        get: {
            tags: ['Health'],
            summary: 'Health check',
            description: 'Check the health status of the API and database connection',
            responses: {
                '200': {
                    description: 'Service is healthy',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: {
                                        type: 'string',
                                        example: 'ok',
                                    },
                                    timestamp: {
                                        type: 'string',
                                        format: 'date-time',
                                    },
                                    uptime: {
                                        type: 'number',
                                        example: 3600.5,
                                        description: 'Uptime in seconds',
                                    },
                                    database: {
                                        type: 'string',
                                        example: 'connected',
                                    },
                                },
                            },
                        },
                    },
                },
                '503': {
                    description: 'Service unavailable',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: {
                                        type: 'string',
                                        example: 'error',
                                    },
                                    error: {
                                        type: 'string',
                                        example: 'Database connection failed',
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
