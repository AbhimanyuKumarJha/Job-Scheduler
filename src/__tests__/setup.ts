import * as dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set default test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://jobscheduler:jobscheduler_password@localhost:5432/job_scheduler_test';
process.env.PORT = process.env.PORT || '3001';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Global test timeout
jest.setTimeout(30000);

// Clean up after all tests
afterAll(async () => {
    // Give time for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 500));
});
