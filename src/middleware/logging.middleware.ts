import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../config/logger';

const requestLogger = createLogger('RequestLogger');

export const requestLogging = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;

        const logData = {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        };

        if (res.statusCode >= 400) {
            requestLogger.warn('Request completed with error', logData);
        } else {
            requestLogger.info('Request completed', logData);
        }
    });

    next();
};
