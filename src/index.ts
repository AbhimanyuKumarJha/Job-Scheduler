import express, { Express, Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { testConnection } from './config/database';
import { logger, createLogger } from './config/logger';
import { setupSwagger } from './config/swagger';
import { errorHandler, notFound } from './middleware/error.middleware';
import { requestLogging } from './middleware/logging.middleware';
import { SchedulerEngine } from './scheduler/scheduler-engine';
import { setSchedulerEngine } from './controllers/health.controller';
import apiRoutes from './routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const appLogger = createLogger('Application');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogging);

// Setup Swagger documentation
setupSwagger(app);

// Routes
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Job Scheduler API is running!',
        version: '1.0.0',
        documentation: '/docs',
        apiSpec: '/docs/openapi.json',
        health: '/api/v1/health'
    });
});

// API Routes
app.use('/api/v1', apiRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize scheduler engine
const schedulerEngine = new SchedulerEngine();
setSchedulerEngine(schedulerEngine);

// Start server
const startServer = async () => {
    try {
        // Test database connection
        appLogger.info('Testing database connection...');
        const dbConnected = await testConnection();

        if (!dbConnected) {
            throw new Error('Database connection failed');
        }

        appLogger.info('Database connection successful');

        // Start HTTP server
        const server = app.listen(port, () => {
            appLogger.info(`Server is running at http://localhost:${port}`);
            logger.info(`⚡️[server]: Server started successfully on port ${port}`);
        });

        // Start scheduler engine
        appLogger.info('Starting scheduler engine...');
        await schedulerEngine.start();
        appLogger.info('Scheduler engine started successfully');

        // Graceful shutdown
        const gracefulShutdown = async (signal: string) => {
            appLogger.info(`${signal} received. Starting graceful shutdown...`);

            server.close(async () => {
                appLogger.info('HTTP server closed');

                try {
                    await schedulerEngine.stop();
                    appLogger.info('Scheduler engine stopped');

                    appLogger.info('✅ Graceful shutdown completed');
                    process.exit(0);
                } catch (error) {
                    appLogger.error('Error during shutdown', {
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                    process.exit(1);
                }
            });

            // Force shutdown after 30 seconds
            setTimeout(() => {
                appLogger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 30000);
        };

        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error: Error) => {
            appLogger.error('Uncaught Exception', {
                error: error.message,
                stack: error.stack
            });
            process.exit(1);
        });

        process.on('unhandledRejection', (reason: any) => {
            appLogger.error('Unhandled Rejection', { reason });
            process.exit(1);
        });

    } catch (error) {
        appLogger.error('Failed to start server', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        process.exit(1);
    }
};

// Start the application
startServer();
export default app;
