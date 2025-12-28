import request from 'supertest';
import express from 'express';
import executionRoutes from '../routes/execution.routes';
import { errorHandler } from '../middleware/error.middleware';
import { mockExecutionService } from './mocks';

jest.mock('../config/database');
jest.mock('../services/execution.service', () => ({
    ExecutionService: jest.fn().mockImplementation(() => mockExecutionService),
}));

const app = express();
app.use(express.json());
app.use('/api/v1/executions', executionRoutes);
app.use(errorHandler);

describe('Execution API Endpoints', () => {
    let mockExecutionId: string;

    beforeEach(() => {
        mockExecutionId = '660e8400-e29b-41d4-a716-446655440000';
        jest.clearAllMocks();
    });

    describe('GET /api/v1/executions/:executionId', () => {
        it('should return execution details by ID', async () => {
            const response = await request(app)
                .get(`/api/v1/executions/${mockExecutionId}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('jobId');
            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('scheduledAt');
        });

        it('should return 404 for non-existent execution', async () => {
            const nonExistentId = '660e8400-e29b-41d4-a716-446655440999';
            const response = await request(app)
                .get(`/api/v1/executions/${nonExistentId}`)
                .expect(404);

            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 for invalid UUID', async () => {
            const response = await request(app)
                .get('/api/v1/executions/invalid-uuid')
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/v1/executions/:executionId/logs', () => {
        it('should return execution logs', async () => {
            const response = await request(app)
                .get(`/api/v1/executions/${mockExecutionId}/logs`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('executionId');
            expect(response.body).toHaveProperty('logs');
            expect(Array.isArray(response.body.logs)).toBe(true);
        });

        it('should return empty array for execution with no logs', async () => {
            const response = await request(app)
                .get(`/api/v1/executions/${mockExecutionId}/logs`)
                .expect(200);

            expect(response.body.logs).toBeDefined();
            expect(Array.isArray(response.body.logs)).toBe(true);
        });

        it('should return 404 for non-existent execution logs', async () => {
            const nonExistentId = '660e8400-e29b-41d4-a716-446655440999';
            const response = await request(app)
                .get(`/api/v1/executions/${nonExistentId}/logs`)
                .expect(404);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/v1/executions', () => {
        it('should return list of recent executions', async () => {
            const response = await request(app)
                .get('/api/v1/executions')
                .query({ limit: 10 })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('executions');
            expect(Array.isArray(response.body.executions)).toBe(true);
            expect(response.body.executions.length).toBeLessThanOrEqual(10);
        });

        it('should filter executions by status', async () => {
            const response = await request(app)
                .get('/api/v1/executions')
                .query({ status: 'SUCCESS' })
                .expect(200);

            expect(response.body).toHaveProperty('executions');
        });

        it('should support different statuses', async () => {
            const statuses = ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'RETRYING'];

            for (const status of statuses) {
                const response = await request(app)
                    .get('/api/v1/executions')
                    .query({ status })
                    .expect(200);

                expect(response.body).toHaveProperty('executions');
            }
        });

        it('should default to limit of 5 if not specified', async () => {
            const response = await request(app)
                .get('/api/v1/executions')
                .expect(200);

            expect(response.body.executions.length).toBeLessThanOrEqual(5);
        });
    });

    describe('Execution status validation', () => {
        it('should accept valid execution statuses', async () => {
            const validStatuses = ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'RETRYING'];

            for (const status of validStatuses) {
                const response = await request(app)
                    .get('/api/v1/executions')
                    .query({ status })
                    .expect(200);

                expect(response.status).toBe(200);
            }
        });

        it('should reject invalid execution status', async () => {
            const response = await request(app)
                .get('/api/v1/executions')
                .query({ status: 'INVALID_STATUS' })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });
});
