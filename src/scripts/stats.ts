import * as dotenv from 'dotenv';
import { db } from '../config/database';
import { jobs, jobExecutions, jobExecutionLogs } from '../db/schema';
import { createLogger } from '../config/logger';
import { sql, count, eq } from 'drizzle-orm';

dotenv.config();

const logger = createLogger('Stats');

async function getStats() {
    try {
        logger.info('Fetching database statistics...');

        // Get job counts by status
        const jobStats = await db
            .select({
                status: jobs.status,
                count: count(),
            })
            .from(jobs)
            .groupBy(jobs.status);

        // Get execution counts by status
        const executionStats = await db
            .select({
                status: jobExecutions.status,
                count: count(),
            })
            .from(jobExecutions)
            .groupBy(jobExecutions.status);

        // Get total counts
        const totalJobs = await db.select({ count: count() }).from(jobs);
        const totalExecutions = await db.select({ count: count() }).from(jobExecutions);
        const totalLogs = await db.select({ count: count() }).from(jobExecutionLogs);

        // Get schedule distribution
        const schedulePattern = await db.execute(sql`
            SELECT 
                CASE 
                    WHEN schedule LIKE '0 * * * * *' THEN 'Every minute'
                    WHEN schedule LIKE '0 */5 * * * *' THEN 'Every 5 minutes'
                    WHEN schedule LIKE '0 0 * * * *' THEN 'Every hour'
                    WHEN schedule LIKE '0 0 */6 * * *' THEN 'Every 6 hours'
                    ELSE 'Other'
                END as schedule_type,
                COUNT(*) as count
            FROM jobs
            GROUP BY schedule_type
            ORDER BY count DESC
        `);

        // Print statistics
        console.log('\n');
        logger.info('═══════════════════════════════════════════════');
        logger.info('          📊 DATABASE STATISTICS');
        logger.info('═══════════════════════════════════════════════');

        logger.info('\n📋 TOTAL COUNTS:');
        logger.info(`   Jobs:       ${totalJobs[0].count}`);
        logger.info(`   Executions: ${totalExecutions[0].count}`);
        logger.info(`   Logs:       ${totalLogs[0].count}`);

        logger.info('\n🔄 JOB STATUS DISTRIBUTION:');
        jobStats.forEach(stat => {
            logger.info(`   ${stat.status.padEnd(10)}: ${stat.count}`);
        });

        if (executionStats.length > 0) {
            logger.info('\n⚡ EXECUTION STATUS DISTRIBUTION:');
            executionStats.forEach(stat => {
                logger.info(`   ${stat.status.padEnd(10)}: ${stat.count}`);
            });
        }

        if (schedulePattern.rows.length > 0) {
            logger.info('\n⏰ SCHEDULE DISTRIBUTION:');
            schedulePattern.rows.forEach((row: any) => {
                logger.info(`   ${row.schedule_type.padEnd(20)}: ${row.count}`);
            });
        }

        // Get recent jobs
        const recentJobs = await db
            .select({
                name: jobs.name,
                schedule: jobs.schedule,
                status: jobs.status,
                createdAt: jobs.createdAt,
            })
            .from(jobs)
            .orderBy(sql`${jobs.createdAt} DESC`)
            .limit(5);

        if (recentJobs.length > 0) {
            logger.info('\n📝 RECENT JOBS (Last 5):');
            recentJobs.forEach((job, index) => {
                logger.info(`   ${index + 1}. ${job.name} - ${job.status} (${job.schedule})`);
            });
        }

        logger.info('\n═══════════════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        logger.error('❌ Error fetching statistics:', error);
        process.exit(1);
    }
}

// Run the stats function
getStats();
