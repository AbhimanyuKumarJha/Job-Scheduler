import express, { Express, Request, Response } from 'express';
import { testConnection } from '../config/database';
import { SchedulerEngine } from '../scheduler/scheduler-engine';
import { createLogger } from '../config/logger';

const healthLogger = createLogger('HealthCheck');
let schedulerEngine: SchedulerEngine | null = null;

export const setSchedulerEngine = (engine: SchedulerEngine) => {
    schedulerEngine = engine;
};

export const healthCheck = async (req: Request, res: Response) => {
    try {
        const dbConnected = await testConnection();
        const schedulerStatus = schedulerEngine?.getStatus();

        const health = {
            status: dbConnected ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            database: dbConnected ? 'connected' : 'disconnected',
            scheduler: schedulerStatus?.status || 'unknown',
            uptime: process.uptime() * 1000,
            instanceId: schedulerStatus?.instanceId || 'unknown',
        };

        healthLogger.info('Health check performed', health);

        res.status(dbConnected ? 200 : 503).json(health);
    } catch (error) {
        healthLogger.error('Health check failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export const schedulerStatus = async (req: Request, res: Response) => {
    try {
        if (!schedulerEngine) {
            return res.status(503).json({
                error: 'Scheduler engine not initialized',
            });
        }

        const status = schedulerEngine.getStatus();

        res.json({
            ...status,
            currentlyRunningJobs: 0, // TODO: Track running jobs
            queuedJobs: 0, // TODO: Track queued jobs
            workerPoolSize: 50, // TODO: Make configurable
            workerPoolUtilization: 0, // TODO: Calculate utilization
        });
    } catch (error) {
        healthLogger.error('Failed to get scheduler status', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        res.status(500).json({
            error: error instanceof Error ? error.message : 'Internal server error',
        });
    }
};
