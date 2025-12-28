import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { createLogger } from './logger';

dotenv.config();

const dbLogger = createLogger('Database');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    dbLogger.info('New client connected to the database');
});

pool.on('error', (err) => {
    dbLogger.error('Unexpected database error', { error: err.message, stack: err.stack });
});

export const db = drizzle(pool);
export { pool };

export const testConnection = async () => {
    try {
        await pool.query('SELECT 1');
        dbLogger.info('Database connection test successful');
        return true;
    } catch (error) {
        dbLogger.error('Database connection test failed', { error });
        return false;
    }
};
