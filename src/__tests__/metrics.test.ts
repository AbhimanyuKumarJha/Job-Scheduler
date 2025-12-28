import request from 'supertest';
import express from 'express';
import metricsRoutes from '../routes/metrics.routes';
import { errorHandler } from '../middleware/error.middleware';
import { mockJobService } from './mocks';

jest.mock('../config/database');
jest.mock('../services/job.service', () => ({
    JobService: jest.fn().mockImplementation(() => mockJobService),
}));

const app = express();
app.use(express.json());
app.use('/api/v1/metrics', metricsRoutes);
app.use(errorHandler);

describe('Metrics API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/metrics', () => {
        it('should return system metrics', async () => {
            const response = await request(app)
                .get('/api/v1/metrics')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('totalJobs');
            expect(response.body).toHaveProperty('activeJobs');
            expect(response.body).toHaveProperty('totalExecutions');
            expect(response.body).toHaveProperty('successfulExecutions');
            expect(response.body).toHaveProperty('failedExecutions');
            expect(response.body).toHaveProperty('averageExecutionTime');
        });

        it('should return numeric values for all metrics', async () => {
            const response = await request(app)
                .get('/api/v1/metrics')
                .expect(200);

            expect(typeof response.body.totalJobs).toBe('number');
            expect(typeof response.body.activeJobs).toBe('number');
            expect(typeof response.body.totalExecutions).toBe('number');
            expect(typeof response.body.successfulExecutions).toBe('number');
            expect(typeof response.body.failedExecutions).toBe('number');
            expect(typeof response.body.averageExecutionTime).toBe('number');
        });

        it('should return non-negative values', async () => {
            const response = await request(app)
                .get('/api/v1/metrics')
                .expect(200);

            expect(response.body.totalJobs).toBeGreaterThanOrEqual(0);
            expect(response.body.activeJobs).toBeGreaterThanOrEqual(0);
            expect(response.body.totalExecutions).toBeGreaterThanOrEqual(0);
            expect(response.body.successfulExecutions).toBeGreaterThanOrEqual(0);
            expect(response.body.failedExecutions).toBeGreaterThanOrEqual(0);
            expect(response.body.averageExecutionTime).toBeGreaterThanOrEqual(0);
        });

        it('should have activeJobs <= totalJobs', async () => {
            const response = await request(app)
                .get('/api/v1/metrics')
                .expect(200);

            expect(response.body.activeJobs).toBeLessThanOrEqual(response.body.totalJobs);
        });

        it('should have sum of successful and failed <= totalExecutions', async () => {
            const response = await request(app)
                .get('/api/v1/metrics')
                .expect(200);

            const sum = response.body.successfulExecutions + response.body.failedExecutions;
            expect(sum).toBeLessThanOrEqual(response.body.totalExecutions);
        });
    });

    describe('Metrics calculation', () => {
        it('should calculate success rate correctly', async () => {
            const response = await request(app)
                .get('/api/v1/metrics')
                .expect(200);

            if (response.body.totalExecutions > 0) {
                const successRate = (response.body.successfulExecutions / response.body.totalExecutions) * 100;
                expect(successRate).toBeGreaterThanOrEqual(0);
                expect(successRate).toBeLessThanOrEqual(100);
            }
        });

        it('should calculate failure rate correctly', async () => {
            const response = await request(app)
                .get('/api/v1/metrics')
                .expect(200);

            if (response.body.totalExecutions > 0) {
                const failureRate = (response.body.failedExecutions / response.body.totalExecutions) * 100;
                expect(failureRate).toBeGreaterThanOrEqual(0);
                expect(failureRate).toBeLessThanOrEqual(100);
            }
        });
    });
});
