import request from 'supertest';
import express from 'express';
import jobRoutes from '../routes/job.routes';
import { errorHandler } from '../middleware/error.middleware';
import { mockJobService } from './mocks';

// Mock the services
jest.mock('../config/database');
jest.mock('../services/job.service', () => ({
    JobService: jest.fn().mockImplementation(() => mockJobService),
}));

const app = express();
app.use(express.json());
app.use('/api/v1/jobs', jobRoutes);
app.use(errorHandler);

describe('Job API Endpoints', () => {
    let mockJobId: string;

    beforeEach(() => {
        mockJobId = '550e8400-e29b-41d4-a716-446655440000';
        jest.clearAllMocks();
    });

    describe('POST /api/v1/jobs', () => {
        it('should create a new job with valid data', async () => {
            const newJob = {
                name: 'Test Job',
                schedule: '*/30 * * * * *',
                api: 'https://api.example.com/test',
                timeoutMs: 30000,
            };

            const response = await request(app)
                .post('/api/v1/jobs')
                .send(newJob)
                .expect('Content-Type', /json/);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('jobId');
            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('createdAt');
        });

        it('should return 400 for invalid cron expression', async () => {
            const invalidJob = {
                name: 'Invalid Job',
                schedule: 'invalid-cron',
                api: 'https://api.example.com/test',
            };

            const response = await request(app)
                .post('/api/v1/jobs')
                .send(invalidJob)
                .expect('Content-Type', /json/);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 for invalid API URL', async () => {
            const invalidJob = {
                name: 'Invalid Job',
                schedule: '*/30 * * * * *',
                api: 'not-a-url',
            };

            const response = await request(app)
                .post('/api/v1/jobs')
                .send(invalidJob)
                .expect('Content-Type', /json/);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('should create job with retry policy', async () => {
            const newJob = {
                name: 'Job with Retry',
                schedule: '0 0 * * * *',
                api: 'https://api.example.com/test',
                retryPolicy: {
                    maxRetries: 3,
                    backoffStrategy: 'EXPONENTIAL',
                    initialDelayMs: 1000,
                    maxDelayMs: 30000,
                },
            };

            const response = await request(app)
                .post('/api/v1/jobs')
                .send(newJob)
                .expect(201);

            expect(response.body).toHaveProperty('jobId');
        });
    });

    describe('GET /api/v1/jobs', () => {
        it('should return a list of jobs with pagination', async () => {
            const response = await request(app)
                .get('/api/v1/jobs')
                .query({ page: 1, limit: 20 })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('jobs');
            expect(response.body).toHaveProperty('pagination');
            expect(Array.isArray(response.body.jobs)).toBe(true);
            expect(response.body.pagination).toHaveProperty('page');
            expect(response.body.pagination).toHaveProperty('limit');
            expect(response.body.pagination).toHaveProperty('total');
            expect(response.body.pagination).toHaveProperty('totalPages');
        });

        it('should filter jobs by status', async () => {
            const response = await request(app)
                .get('/api/v1/jobs')
                .query({ status: 'ACTIVE' })
                .expect(200);

            expect(response.body).toHaveProperty('jobs');
        });

        it('should support sorting', async () => {
            const response = await request(app)
                .get('/api/v1/jobs')
                .query({ sortBy: 'createdAt', order: 'desc' })
                .expect(200);

            expect(response.body).toHaveProperty('jobs');
        });
    });

    describe('GET /api/v1/jobs/:jobId', () => {
        it('should return a specific job by ID', async () => {
            const response = await request(app)
                .get(`/api/v1/jobs/${mockJobId}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('jobId');
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('schedule');
            expect(response.body).toHaveProperty('status');
        });

        it('should return 404 for non-existent job', async () => {
            const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
            const response = await request(app)
                .get(`/api/v1/jobs/${nonExistentId}`)
                .expect(404);

            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 for invalid UUID', async () => {
            const response = await request(app)
                .get('/api/v1/jobs/invalid-uuid')
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('PATCH /api/v1/jobs/:jobId', () => {
        it('should update a job', async () => {
            const updates = {
                name: 'Updated Job Name',
                schedule: '0 0 12 * * *',
            };

            const response = await request(app)
                .patch(`/api/v1/jobs/${mockJobId}`)
                .send(updates)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('jobId');
            expect(response.body).toHaveProperty('updatedAt');
        });

        it('should return 404 for updating non-existent job', async () => {
            const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
            const response = await request(app)
                .patch(`/api/v1/jobs/${nonExistentId}`)
                .send({ name: 'Updated' })
                .expect(404);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('DELETE /api/v1/jobs/:jobId', () => {
        it('should soft delete a job', async () => {
            const response = await request(app)
                .delete(`/api/v1/jobs/${mockJobId}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('jobId');
            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('DELETED');
        });

        it('should return 404 for deleting non-existent job', async () => {
            const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
            const response = await request(app)
                .delete(`/api/v1/jobs/${nonExistentId}`)
                .expect(404);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/v1/jobs/:jobId/pause', () => {
        it('should pause an active job', async () => {
            const response = await request(app)
                .post(`/api/v1/jobs/${mockJobId}/pause`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('jobId');
            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('PAUSED');
        });

        it('should return 404 for pausing non-existent job', async () => {
            const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
            const response = await request(app)
                .post(`/api/v1/jobs/${nonExistentId}/pause`)
                .expect(404);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/v1/jobs/:jobId/resume', () => {
        it('should resume a paused job', async () => {
            const response = await request(app)
                .post(`/api/v1/jobs/${mockJobId}/resume`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('jobId');
            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('ACTIVE');
        });

        it('should return 404 for resuming non-existent job', async () => {
            const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
            const response = await request(app)
                .post(`/api/v1/jobs/${nonExistentId}/resume`)
                .expect(404);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/v1/jobs/:jobId/executions', () => {
        it('should return executions for a job', async () => {
            const response = await request(app)
                .get(`/api/v1/jobs/${mockJobId}/executions`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('jobId');
            expect(response.body).toHaveProperty('executions');
            expect(Array.isArray(response.body.executions)).toBe(true);
        });

        it('should filter executions by status', async () => {
            const response = await request(app)
                .get(`/api/v1/jobs/${mockJobId}/executions`)
                .query({ status: 'SUCCESS' })
                .expect(200);

            expect(response.body).toHaveProperty('executions');
        });

        it('should limit number of executions returned', async () => {
            const response = await request(app)
                .get(`/api/v1/jobs/${mockJobId}/executions`)
                .query({ limit: 5 })
                .expect(200);

            expect(response.body.executions.length).toBeLessThanOrEqual(5);
        });
    });

    describe('POST /api/v1/jobs/:jobId/trigger', () => {
        it('should trigger a job manually', async () => {
            const response = await request(app)
                .post(`/api/v1/jobs/${mockJobId}/trigger`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('executionId');
            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('scheduledAt');
        });

        it('should return 404 for triggering non-existent job', async () => {
            const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
            const response = await request(app)
                .post(`/api/v1/jobs/${nonExistentId}/trigger`)
                .expect(404);

            expect(response.body).toHaveProperty('error');
        });
    });
});
