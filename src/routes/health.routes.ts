import { Router } from 'express';
import { healthCheck, schedulerStatus } from '../controllers/health.controller';

const router = Router();

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     description: Check the health status of the API, database, and scheduler
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       503:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', healthCheck);

/**
 * @openapi
 * /api/v1/health/scheduler:
 *   get:
 *     tags: [Health]
 *     summary: Scheduler status
 *     description: Get the current status of the job scheduler engine
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.get('/scheduler', schedulerStatus);

export default router;
