// Mock implementations for all services
export const mockJobService = {
    createJob: jest.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Job',
        schedule: '*/30 * * * * *',
        apiEndpoint: 'https://api.example.com/test',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
    }),
    getJobById: jest.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Job',
        schedule: '*/30 * * * * *',
        apiEndpoint: 'https://api.example.com/test',
        status: 'ACTIVE',
        executionType: 'ATLEAST_ONCE',
        createdAt: new Date(),
        updatedAt: new Date(),
        nextScheduledRun: new Date(),
        metadata: null,
    }),
    updateJob: jest.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        status: 'PAUSED',
        updatedAt: new Date(),
    }),
    deleteJob: jest.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        status: 'DELETED',
    }),
    listJobs: jest.fn().mockResolvedValue({
        jobs: [],
        pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
        },
    }),
    getJobExecutions: jest.fn().mockResolvedValue([]),
    triggerJob: jest.fn().mockResolvedValue({
        id: '660e8400-e29b-41d4-a716-446655440000',
        status: 'PENDING',
        scheduledAt: new Date(),
    }),
    getMetrics: jest.fn().mockResolvedValue({
        totalJobs: 10,
        activeJobs: 5,
        totalExecutions: 100,
        successfulExecutions: 80,
        failedExecutions: 20,
        averageExecutionTime: 1500,
    }),
};

export const mockExecutionService = {
    getExecutionById: jest.fn().mockResolvedValue({
        id: '660e8400-e29b-41d4-a716-446655440000',
        jobId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'SUCCESS',
        scheduledAt: new Date(),
        startedAt: new Date(),
        completedAt: new Date(),
        httpStatusCode: 200,
        executionDurationMs: 1500,
        retryCount: 0,
    }),
    getExecutionLogs: jest.fn().mockResolvedValue([]),
    listRecentExecutions: jest.fn().mockResolvedValue([]),
};

export const mockDatabase = {
    testConnection: jest.fn().mockResolvedValue(true),
};
