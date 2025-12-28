import * as dotenv from 'dotenv';
import { db } from '../config/database';
import { jobs, jobExecutions, jobExecutionLogs, schedulerMetadata, jobAuditLog, failedJobsDLQ } from '../db/schema';
import { createLogger } from '../config/logger';
import { sql } from 'drizzle-orm';

dotenv.config();

const logger = createLogger('Clear');

async function clearDatabase() {
    try {
        logger.info('Starting database cleanup...');

        // Delete in reverse order of dependencies
        logger.info('Deleting failed jobs from DLQ...');
        await db.delete(failedJobsDLQ);

        logger.info('Deleting job audit logs...');
        await db.delete(jobAuditLog);

        logger.info('Deleting job execution logs...');
        await db.delete(jobExecutionLogs);

        logger.info('Deleting job executions...');
        await db.delete(jobExecutions);

        logger.info('Deleting scheduler metadata...');
        await db.delete(schedulerMetadata);

        logger.info('Deleting jobs...');
        await db.delete(jobs);

        logger.info('✅ Database cleared successfully!');

        // Get counts to verify
        const counts = await db.execute(sql`
            SELECT 
                (SELECT COUNT(*) FROM jobs) as job_count,
                (SELECT COUNT(*) FROM job_executions) as execution_count,
                (SELECT COUNT(*) FROM job_execution_logs) as log_count
        `);

        logger.info('\n📊 Final Counts:');
        logger.info(`   Jobs: ${counts.rows[0].job_count}`);
        logger.info(`   Executions: ${counts.rows[0].execution_count}`);
        logger.info(`   Logs: ${counts.rows[0].log_count}`);

        process.exit(0);
    } catch (error) {
        logger.error('❌ Error clearing database:', error);
        process.exit(1);
    }
}

// Run the clear function
clearDatabase();
