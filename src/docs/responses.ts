/**
 * OpenAPI Response Definitions
 * Reusable response definitions for API documentation
 */

export const responses = {
    // Success Responses
    200: {
        description: 'Success',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/SuccessResponse'
                }
            }
        }
    },

    201: {
        description: 'Created',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/SuccessResponse'
                }
            }
        }
    },

    // Error Responses
    400: {
        description: 'Bad Request',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                },
                example: {
                    success: false,
                    error: 'Validation error',
                    details: {
                        field: 'schedule',
                        message: 'Invalid cron expression'
                    }
                }
            }
        }
    },

    404: {
        description: 'Not Found',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                },
                example: {
                    success: false,
                    error: 'Resource not found'
                }
            }
        }
    },

    500: {
        description: 'Internal Server Error',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                },
                example: {
                    success: false,
                    error: 'Internal server error'
                }
            }
        }
    }
};
