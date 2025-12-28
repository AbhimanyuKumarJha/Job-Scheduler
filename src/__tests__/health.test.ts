import request from 'supertest';
import express from 'express';
import healthRoutes from '../routes/health.routes';
import { errorHandler } from '../middleware/error.middleware';
import { mockDatabase } from './mocks';

jest.mock('../config/database', () => ({
    testConnection: jest.fn().mockResolvedValue(true),
    db: {},
    pool: {},
}));

const app = express();
app.use(express.json());
app.use('/api/v1/health', healthRoutes);
app.use(errorHandler);

describe('Health Check API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/health', () => {
        it('should return health check status', async () => {
            const response = await request(app)
                .get('/api/v1/health')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('uptime');
            expect(response.body).toHaveProperty('database');
            expect(response.body).toHaveProperty('scheduler');
        });

        it('should return status as "healthy"', async () => {
            const response = await request(app)
                .get('/api/v1/health')
                .expect(200);

            expect(response.body.status).toBe('healthy');
        });

        it('should return valid timestamp', async () => {
            const response = await request(app)
                .get('/api/v1/health')
                .expect(200);

            expect(response.body.timestamp).toBeDefined();
            const timestamp = new Date(response.body.timestamp);
            expect(timestamp).toBeInstanceOf(Date);
            expect(timestamp.getTime()).not.toBeNaN();
        });

        it('should return numeric uptime', async () => {
            const response = await request(app)
                .get('/api/v1/health')
                .expect(200);

            expect(typeof response.body.uptime).toBe('number');
            expect(response.body.uptime).toBeGreaterThan(0);
        });

        it('should return database connection status', async () => {
            const response = await request(app)
                .get('/api/v1/health')
                .expect(200);

            expect(response.body.database).toBeDefined();
            expect(['connected', 'disconnected', 'error']).toContain(response.body.database);
        });

        it('should return scheduler status', async () => {
            const response = await request(app)
                .get('/api/v1/health')
                .expect(200);

            expect(response.body.scheduler).toBeDefined();
            expect(['active', 'inactive', 'error']).toContain(response.body.scheduler);
        });

        it('should respond quickly (< 1000ms)', async () => {
            const startTime = Date.now();

            await request(app)
                .get('/api/v1/health')
                .expect(200);

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            expect(responseTime).toBeLessThan(1000);
        });
    });

    describe('Health check format', () => {
        it('should return all required fields', async () => {
            const response = await request(app)
                .get('/api/v1/health')
                .expect(200);

            const requiredFields = ['status', 'timestamp', 'uptime', 'database', 'scheduler'];
            requiredFields.forEach(field => {
                expect(response.body).toHaveProperty(field);
            });
        });

        it('should not contain sensitive information', async () => {
            const response = await request(app)
                .get('/api/v1/health')
                .expect(200);

            expect(response.body).not.toHaveProperty('password');
            expect(response.body).not.toHaveProperty('secret');
            expect(response.body).not.toHaveProperty('token');
            expect(response.body).not.toHaveProperty('apiKey');
        });
    });
});
