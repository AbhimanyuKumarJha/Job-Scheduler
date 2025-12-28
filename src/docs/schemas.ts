/**
 * OpenAPI Component Schemas
 * Reusable schema definitions for API documentation
 */

export const schemas = {
    // Base Types
    UUID: {
        type: 'string',
        format: 'uuid',
        example: '550e8400-e29b-41d4-a716-446655440000'
    },

    Timestamp: {
        type: 'string',
        format: 'date-time',
        example: '2025-12-28T10:30:00Z'
    },

    // Job Schemas
    Job: {
        type: 'object',
        properties: {
            id: { $ref: '#/components/schemas/UUID' },
            name: { type: 'string', example: 'Daily Backup Job' },
            schedule: {
                type: 'string',
                example: '0 0 * * *',
                description: 'Cron expression (sec min hour day month dayOfWeek)'
            },
            apiEndpoint: {
                type: 'string',
                format: 'uri',
                example: 'https://api.example.com/webhook'
            },
            executionType: {
                type: 'string',
                enum: ['ATLEAST_ONCE'],
                default: 'ATLEAST_ONCE'
            },
            status: {
                type: 'string',
                enum: ['ACTIVE', 'PAUSED', 'DELETED'],
                default: 'ACTIVE'
            },
            createdAt: { $ref: '#/components/schemas/Timestamp' },
            updatedAt: { $ref: '#/components/schemas/Timestamp' },
            createdBy: { type: 'string', nullable: true },
            metadata: { type: 'object', nullable: true },
            timeoutMs: { type: 'integer', default: 30000 },
            retryPolicy: { $ref: '#/components/schemas/RetryPolicy' },
            maxConcurrentExecutions: { type: 'integer', default: 1 },
            rateLimitPerMinute: { type: 'integer', nullable: true }
        }
    },

    CreateJobRequest: {
        type: 'object',
        required: ['schedule', 'api'],
        properties: {
            name: { type: 'string', example: 'Daily Backup Job' },
            schedule: {
                type: 'string',
                example: '0 0 * * *',
                description: 'Cron expression (sec min hour day month dayOfWeek)'
            },
            api: {
                type: 'string',
                format: 'uri',
                example: 'https://api.example.com/webhook'
            },
            type: {
                type: 'string',
                enum: ['ATLEAST_ONCE'],
                default: 'ATLEAST_ONCE'
            },
            metadata: { type: 'object' },
            timeoutMs: { type: 'integer', minimum: 1000, maximum: 300000 },
            retryPolicy: { $ref: '#/components/schemas/RetryPolicy' },
            maxConcurrentExecutions: { type: 'integer', minimum: 1 },
            rateLimitPerMinute: { type: 'integer', minimum: 1 }
        }
    },

    UpdateJobRequest: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            schedule: { type: 'string' },
            api: { type: 'string', format: 'uri' },
            status: { type: 'string', enum: ['ACTIVE', 'PAUSED', 'DELETED'] },
            metadata: { type: 'object' },
            timeoutMs: { type: 'integer' },
            retryPolicy: { $ref: '#/components/schemas/RetryPolicy' },
            maxConcurrentExecutions: { type: 'integer' },
            rateLimitPerMinute: { type: 'integer' }
        }
    },

    RetryPolicy: {
        type: 'object',
        nullable: true,
        properties: {
            maxRetries: { type: 'integer', minimum: 0, maximum: 10 },
            backoffStrategy: {
                type: 'string',
                enum: ['EXPONENTIAL', 'LINEAR', 'FIXED']
            },
            initialDelayMs: { type: 'integer', minimum: 100 },
            maxDelayMs: { type: 'integer' }
        }
    },

    // Execution Schemas
    JobExecution: {
        type: 'object',
        properties: {
            id: { $ref: '#/components/schemas/UUID' },
            jobId: { $ref: '#/components/schemas/UUID' },
            scheduledAt: { $ref: '#/components/schemas/Timestamp' },
            startedAt: { $ref: '#/components/schemas/Timestamp', nullable: true },
            completedAt: { $ref: '#/components/schemas/Timestamp', nullable: true },
            status: {
                type: 'string',
                enum: ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'RETRYING']
            },
            httpStatusCode: { type: 'integer', nullable: true },
            responseBody: { type: 'string', nullable: true },
            errorMessage: { type: 'string', nullable: true },
            executionDurationMs: { type: 'integer', nullable: true },
            retryCount: { type: 'integer', default: 0 },
            createdAt: { $ref: '#/components/schemas/Timestamp' }
        }
    },

    ExecutionLog: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            executionId: { $ref: '#/components/schemas/UUID' },
            logLevel: { type: 'string', enum: ['INFO', 'WARN', 'ERROR', 'DEBUG'] },
            message: { type: 'string' },
            timestamp: { $ref: '#/components/schemas/Timestamp' },
            metadata: { type: 'object', nullable: true }
        }
    },

    // Alert Schemas
    CreateAlertRequest: {
        type: 'object',
        required: ['type', 'endpoint', 'conditions'],
        properties: {
            type: { type: 'string', enum: ['WEBHOOK', 'EMAIL', 'SLACK'] },
            endpoint: { type: 'string', format: 'uri' },
            conditions: {
                type: 'object',
                properties: {
                    onFailure: { type: 'boolean' },
                    onSuccess: { type: 'boolean' },
                    consecutiveFailures: { type: 'integer', minimum: 1 }
                }
            }
        }
    },

    // Response Schemas
    SuccessResponse: {
        type: 'object',
        properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string' }
        }
    },

    ErrorResponse: {
        type: 'object',
        properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Error message' },
            details: { type: 'object' }
        }
    },

    PaginatedResponse: {
        type: 'object',
        properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'array', items: { type: 'object' } },
            pagination: {
                type: 'object',
                properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    totalPages: { type: 'integer' }
                }
            }
        }
    },

    HealthCheck: {
        type: 'object',
        properties: {
            status: { type: 'string', example: 'healthy' },
            timestamp: { $ref: '#/components/schemas/Timestamp' },
            uptime: { type: 'number', example: 1234.56 },
            database: { type: 'string', example: 'connected' },
            scheduler: { type: 'string', example: 'active' }
        }
    },

    Metrics: {
        type: 'object',
        properties: {
            totalJobs: { type: 'integer' },
            activeJobs: { type: 'integer' },
            totalExecutions: { type: 'integer' },
            successfulExecutions: { type: 'integer' },
            failedExecutions: { type: 'integer' },
            averageExecutionTime: { type: 'number' }
        }
    },

    // Additional Response Schemas
    JobResponse: {
        type: 'object',
        properties: {
            jobId: { $ref: '#/components/schemas/UUID' },
            status: { type: 'string', enum: ['ACTIVE', 'PAUSED', 'DELETED'] },
            createdAt: { $ref: '#/components/schemas/Timestamp' },
            updatedAt: { $ref: '#/components/schemas/Timestamp' },
            name: { type: 'string', nullable: true },
            schedule: { type: 'string', nullable: true },
            api: { type: 'string', nullable: true },
            type: { type: 'string', nullable: true },
            nextScheduledRun: { $ref: '#/components/schemas/Timestamp', nullable: true },
            metadata: { type: 'object', nullable: true }
        }
    },

    JobListResponse: {
        type: 'object',
        properties: {
            jobs: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        jobId: { $ref: '#/components/schemas/UUID' },
                        name: { type: 'string', nullable: true },
                        schedule: { type: 'string' },
                        api: { type: 'string' },
                        type: { type: 'string' },
                        status: { type: 'string' },
                        createdAt: { $ref: '#/components/schemas/Timestamp' },
                        updatedAt: { $ref: '#/components/schemas/Timestamp' },
                        nextScheduledRun: { $ref: '#/components/schemas/Timestamp', nullable: true }
                    }
                }
            },
            pagination: {
                type: 'object',
                properties: {
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 20 },
                    total: { type: 'integer', example: 100 },
                    totalPages: { type: 'integer', example: 5 }
                }
            }
        }
    },

    ExecutionResponse: {
        type: 'object',
        properties: {
            executionId: { $ref: '#/components/schemas/UUID' },
            status: { type: 'string', enum: ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'RETRYING'] },
            scheduledAt: { $ref: '#/components/schemas/Timestamp' }
        }
    },

    ExecutionListResponse: {
        type: 'object',
        properties: {
            jobId: { $ref: '#/components/schemas/UUID' },
            executions: {
                type: 'array',
                items: { $ref: '#/components/schemas/JobExecution' }
            }
        }
    },

    Error: {
        type: 'object',
        properties: {
            error: { type: 'string', example: 'Error message' },
            stack: { type: 'string', nullable: true }
        }
    }
};
