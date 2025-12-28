import * as dotenv from 'dotenv';
import { db } from '../config/database';
import { jobs } from '../db/schema';
import { createLogger } from '../config/logger';

dotenv.config();

const logger = createLogger('Seed');

// Sample API endpoints for testing
const sampleAPIs = [
    'https://jsonplaceholder.typicode.com/posts',
    'https://jsonplaceholder.typicode.com/users',
    'https://jsonplaceholder.typicode.com/comments',
    'https://api.github.com/events',
    'https://api.github.com/users',
    'https://httpbin.org/get',
    'https://httpbin.org/delay/1',
    'https://httpbin.org/status/200',
    'https://dog.ceo/api/breeds/list/all',
    'https://catfact.ninja/fact',
];

// Job templates with different schedules
const jobTemplates = [
    // Every minute jobs (10 jobs)
    ...Array.from({ length: 10 }, (_, i) => ({
        name: `Every Minute Job ${i + 1}`,
        schedule: '0 * * * * *', // Every minute at second 0
        description: 'Runs every minute',
    })),

    // Every 5 minutes jobs (10 jobs)
    ...Array.from({ length: 10 }, (_, i) => ({
        name: `Every 5 Minutes Job ${i + 1}`,
        schedule: '0 */5 * * * *', // Every 5 minutes
        description: 'Runs every 5 minutes',
    })),

    // Every hour jobs (10 jobs)
    ...Array.from({ length: 10 }, (_, i) => ({
        name: `Hourly Job ${i + 1}`,
        schedule: '0 0 * * * *', // Every hour at minute 0
        description: 'Runs every hour',
    })),

    // Every 6 hours jobs (10 jobs)
    ...Array.from({ length: 10 }, (_, i) => ({
        name: `Every 6 Hours Job ${i + 1}`,
        schedule: '0 0 */6 * * *', // Every 6 hours
        description: 'Runs every 6 hours',
    })),

    // Daily jobs at different times (10 jobs)
    ...Array.from({ length: 10 }, (_, i) => ({
        name: `Daily Job ${i + 1}`,
        schedule: `0 0 ${i % 24} * * *`, // Daily at different hours
        description: `Runs daily at ${i % 24}:00`,
    })),
];

const retryPolicies = [
    {
        maxRetries: 3,
        backoffStrategy: 'EXPONENTIAL' as const,
        initialDelayMs: 1000,
        maxDelayMs: 30000,
    },
    {
        maxRetries: 5,
        backoffStrategy: 'LINEAR' as const,
        initialDelayMs: 2000,
        maxDelayMs: 60000,
    },
    {
        maxRetries: 2,
        backoffStrategy: 'FIXED' as const,
        initialDelayMs: 5000,
        maxDelayMs: 5000,
    },
];

const metadata = [
    { environment: 'production', team: 'backend' },
    { environment: 'staging', team: 'frontend' },
    { environment: 'development', team: 'devops' },
    { priority: 'high', category: 'monitoring' },
    { priority: 'medium', category: 'reporting' },
    { priority: 'low', category: 'maintenance' },
];

async function seedJobs() {
    try {
        logger.info('Starting database seeding...');

        const jobsToCreate = jobTemplates.map((template, index) => ({
            name: template.name,
            schedule: template.schedule,
            apiEndpoint: sampleAPIs[index % sampleAPIs.length],
            executionType: 'ATLEAST_ONCE' as const,
            status: index % 10 === 0 ? 'PAUSED' as const : 'ACTIVE' as const, // 10% paused
            createdBy: 'seed-script',
            metadata: metadata[index % metadata.length],
            timeoutMs: 30000 + (index % 5) * 10000, // 30s to 70s
            retryPolicy: retryPolicies[index % retryPolicies.length],
            maxConcurrentExecutions: (index % 3) + 1, // 1-3
            rateLimitPerMinute: index % 2 === 0 ? (index % 10) + 5 : null, // Some with rate limits
        }));

        logger.info(`Creating ${jobsToCreate.length} jobs...`);

        // Insert jobs in batches of 10
        const batchSize = 10;
        for (let i = 0; i < jobsToCreate.length; i += batchSize) {
            const batch = jobsToCreate.slice(i, i + batchSize);
            await db.insert(jobs).values(batch);
            logger.info(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(jobsToCreate.length / batchSize)}`);
        }

        logger.info('✅ Database seeding completed successfully!');

        // Print summary
        const activeJobs = jobsToCreate.filter(j => j.status === 'ACTIVE').length;
        const pausedJobs = jobsToCreate.filter(j => j.status === 'PAUSED').length;

        logger.info('\n📊 Seeding Summary:');
        logger.info(`   Total Jobs: ${jobsToCreate.length}`);
        logger.info(`   Active Jobs: ${activeJobs}`);
        logger.info(`   Paused Jobs: ${pausedJobs}`);
        logger.info('\n⏰ Schedule Distribution:');
        logger.info(`   Every minute: 10 jobs`);
        logger.info(`   Every 5 minutes: 10 jobs`);
        logger.info(`   Every hour: 10 jobs`);
        logger.info(`   Every 6 hours: 10 jobs`);
        logger.info(`   Daily: 10 jobs`);

        process.exit(0);
    } catch (error) {
        logger.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed function
seedJobs();
