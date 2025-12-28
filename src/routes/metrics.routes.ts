import { Router } from 'express';
import { ExecutionController } from '../controllers/execution.controller';

const router = Router();
const executionController = new ExecutionController();

/**
 * @openapi
 * /api/v1/metrics:
 *   get:
 *     tags: [Metrics]
 *     summary: Get system metrics
 *     description: Retrieve system-wide metrics including job counts, execution statistics, and performance data
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Metrics'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.get('/', executionController.getSystemMetrics.bind(executionController));

/**
 * @openapi
 * /api/v1/metrics/jobs/{jobId}:
 *   get:
 *     tags: [Metrics]
 *     summary: Get job metrics
 *     description: Retrieve metrics and statistics for a specific job
 *     parameters:
 *       - $ref: '#/components/parameters/jobId'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       404:
 *         $ref: '#/components/responses/404'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.get('/jobs/:jobId', executionController.getJobMetrics.bind(executionController));

export default router;
