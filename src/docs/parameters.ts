/**
 * OpenAPI Parameter Definitions
 * Reusable parameter definitions for API documentation
 */

export const parameters = {
    // Path Parameters
    jobId: {
        name: 'jobId',
        in: 'path',
        description: 'Job UUID',
        required: true,
        schema: {
            type: 'string',
            format: 'uuid'
        }
    },

    executionId: {
        name: 'executionId',
        in: 'path',
        description: 'Execution UUID',
        required: true,
        schema: {
            type: 'string',
            format: 'uuid'
        }
    },

    // Query Parameters
    page: {
        name: 'page',
        in: 'query',
        description: 'Page number',
        required: false,
        schema: {
            type: 'integer',
            minimum: 1,
            default: 1
        }
    },

    limit: {
        name: 'limit',
        in: 'query',
        description: 'Number of items per page',
        required: false,
        schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20
        }
    },

    status: {
        name: 'status',
        in: 'query',
        description: 'Filter by status',
        required: false,
        schema: {
            type: 'string',
            enum: ['ACTIVE', 'PAUSED', 'DELETED']
        }
    },

    executionStatus: {
        name: 'status',
        in: 'query',
        description: 'Filter by execution status',
        required: false,
        schema: {
            type: 'string',
            enum: ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'RETRYING']
        }
    },

    sortBy: {
        name: 'sortBy',
        in: 'query',
        description: 'Sort by field',
        required: false,
        schema: {
            type: 'string',
            enum: ['createdAt', 'updatedAt'],
            default: 'createdAt'
        }
    },

    order: {
        name: 'order',
        in: 'query',
        description: 'Sort order',
        required: false,
        schema: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'desc'
        }
    }
};
