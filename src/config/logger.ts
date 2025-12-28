import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
        }
        return msg;
    })
);

// Transport for all logs
const allLogsTransport = new DailyRotateFile({
    filename: path.join(logDir, 'all-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    level: 'silly',
    format: logFormat,
});

// Transport for error logs
const errorLogsTransport = new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: logFormat,
});

// Transport for combined logs (info and above)
const combinedLogsTransport = new DailyRotateFile({
    filename: path.join(logDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info',
    format: logFormat,
});

// Transport for job execution logs
const executionLogsTransport = new DailyRotateFile({
    filename: path.join(logDir, 'executions-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info',
    format: logFormat,
});

// Transport for scheduler logs
const schedulerLogsTransport = new DailyRotateFile({
    filename: path.join(logDir, 'scheduler-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    level: 'debug',
    format: logFormat,
});

// Main logger
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        allLogsTransport,
        errorLogsTransport,
        combinedLogsTransport,
    ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: consoleFormat,
            level: 'debug',
        })
    );
}

// Execution logger - for job execution specific logs
export const executionLogger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [executionLogsTransport, allLogsTransport],
});

// Scheduler logger - for scheduler engine specific logs
export const schedulerLogger = winston.createLogger({
    level: 'debug',
    format: logFormat,
    transports: [schedulerLogsTransport, allLogsTransport],
});

// Add console in development for specialized loggers
if (process.env.NODE_ENV !== 'production') {
    executionLogger.add(new winston.transports.Console({ format: consoleFormat }));
    schedulerLogger.add(new winston.transports.Console({ format: consoleFormat }));
}

// Export a function to create context-aware loggers
export const createLogger = (context: string) => {
    return {
        error: (message: string, meta?: any) => logger.error(message, { context, ...meta }),
        warn: (message: string, meta?: any) => logger.warn(message, { context, ...meta }),
        info: (message: string, meta?: any) => logger.info(message, { context, ...meta }),
        debug: (message: string, meta?: any) => logger.debug(message, { context, ...meta }),
        verbose: (message: string, meta?: any) => logger.verbose(message, { context, ...meta }),
    };
};

export default logger;
