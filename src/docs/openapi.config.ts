import { OpenAPIV3 } from 'openapi-types';

export const openAPIConfig: OpenAPIV3.Document = {
    openapi: '3.0.0',
    info: {
        title: 'Job Scheduler API',
        version: '1.0.0',
        description: 'A production-ready job scheduler with cron-based scheduling, retry policies, and comprehensive monitoring',
        contact: {
            name: 'API Support',
            email: 'support@jobscheduler.com',
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
        },
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Development server',
        },
        {
            url: 'https://api.jobscheduler.com',
            description: 'Production server',
        },
    ],
    tags: [
        {
            name: 'Jobs',
            description: 'Job management endpoints',
        },
        {
            name: 'Executions',
            description: 'Job execution tracking endpoints',
        },
        {
            name: 'Metrics',
            description: 'System metrics and monitoring',
        },
        {
            name: 'Health',
            description: 'Health check endpoints',
        },
    ],
    paths: {},
    components: {
        schemas: {},
        responses: {},
        parameters: {},
    },
};
