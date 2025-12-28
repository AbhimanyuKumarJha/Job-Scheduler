# Quick Start Guide

This guide will help you get the Job Scheduler API up and running quickly.

## Prerequisites

**For Docker (Recommended):**

- Docker Desktop or Docker Engine installed
- Docker Compose v2.0+

**For Local Development:**

- Node.js v18+ installed
- PostgreSQL database running
- npm or yarn package manager

---

## Option 1: Quick Start with Docker (Fastest) 🚀

This is the easiest and fastest way to get started - everything runs in containers!

### Step 1: Clone and Start

```bash
# Navigate to project directory
cd "d:/College -project/Job Scheduler"

# Start all services (API + PostgreSQL)
docker-compose up -d
```

That's it! The services are now running:

- **API**: http://localhost:3000
- **PostgreSQL**: localhost:5432

### Step 2: Push Database Schema

```bash
# Push schema to the database (run once)
npx drizzle-kit push --config=./drizzle.config.ts
```

Or if you prefer migrations:

```bash
# Generate migration files
npx drizzle-kit generate

# Run migrations
npx drizzle-kit migrate
```

### Step 3: Verify Installation

Check the health endpoint:

```bash
curl http://localhost:3000/api/v1/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2025-12-28T...",
  "database": "connected",
  "scheduler": "ACTIVE",
  "uptime": 5000,
  "instanceId": "scheduler-..."
}
```

### Step 4: Create Your First Job

```bash
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Job",
    "schedule": "*/30 * * * * *",
    "api": "https://httpbin.org/get",
    "type": "ATLEAST_ONCE"
  }'
```

### Managing Docker Services

```bash
# View logs
docker-compose logs -f job-scheduler

# View all logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove database (clean slate)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build

# View running containers
docker ps
```

### Docker Database Credentials

- **Host**: localhost (or `postgres` from within containers)
- **Port**: 5432
- **Username**: jobscheduler
- **Password**: jobscheduler_password
- **Database**: job_scheduler

### Accessing Database Directly

```bash
# Using Docker
docker exec -it job-scheduler-postgres psql -U jobscheduler -d job_scheduler

# Using local psql client
psql -h localhost -U jobscheduler -d job_scheduler
```

---

## Option 2: Local Development Setup

## Prerequisites

- Node.js v18+ installed
- PostgreSQL database running
- npm or yarn package manager

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Database

1. Create a PostgreSQL database:

```sql
CREATE DATABASE job_scheduler;
```

2. Update `.env` file with your database credentials:

```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/job_scheduler"
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

## Step 3: Set Up Database Schema

Push the schema to your database:

```bash
npm run db:push
```

Or generate and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

## Step 4: Start the Server

Development mode (with hot reload):

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## Step 5: Verify Installation

Check the health endpoint:

```bash
curl http://localhost:3000/api/v1/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2025-12-28T...",
  "database": "connected",
  "scheduler": "ACTIVE",
  "uptime": 5000,
  "instanceId": "scheduler-..."
}
```

## Step 6: Create Your First Job

```bash
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Job",
    "schedule": "*/30 * * * * *",
    "api": "https://httpbin.org/get",
    "type": "ATLEAST_ONCE"
  }'
```

Response:

```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "ACTIVE",
  "createdAt": "2025-12-28T..."
}
```

## Step 7: Monitor Your Job

Get job details:

```bash
curl http://localhost:3000/api/v1/jobs/YOUR_JOB_ID
```

View execution history:

```bash
curl http://localhost:3000/api/v1/jobs/YOUR_JOB_ID/executions
```

Check metrics:

```bash
curl http://localhost:3000/api/v1/metrics/jobs/YOUR_JOB_ID
```

## Cron Expression Format

The scheduler uses 6-field cron expressions (with seconds):

```
* * * * * *
│ │ │ │ │ │
│ │ │ │ │ └─ Day of week (0-6, Sunday = 0)
│ │ │ │ └─── Month (1-12)
│ │ │ └───── Day of month (1-31)
│ │ └─────── Hour (0-23)
│ └───────── Minute (0-59)
└─────────── Second (0-59)
```

Examples:

- `*/30 * * * * *` - Every 30 seconds
- `0 */5 * * * *` - Every 5 minutes
- `0 0 9 * * MON-FRI` - 9 AM on weekdays
- `0 30 14 * * *` - Daily at 2:30 PM

## Viewing Logs

Logs are stored in the `logs/` directory:

- View all logs: `tail -f logs/all-*.log`
- View errors: `tail -f logs/error-*.log`
- View executions: `tail -f logs/executions-*.log`
- View scheduler: `tail -f logs/scheduler-*.log`

## Common Operations

### Pause a Job

```bash
curl -X PUT http://localhost:3000/api/v1/jobs/YOUR_JOB_ID \
  -H "Content-Type: application/json" \
  -d '{"status": "PAUSED"}'
```

### Manually Trigger a Job

```bash
curl -X POST http://localhost:3000/api/v1/jobs/YOUR_JOB_ID/trigger
```

### List All Jobs

```bash
curl http://localhost:3000/api/v1/jobs?status=ACTIVE
```

### Get System Metrics

```bash
curl http://localhost:3000/api/v1/metrics
```

## Production Deployment

1. Build the project:

```bash
npm run build
```

2. Set environment to production:

```env
NODE_ENV=production
LOG_LEVEL=warn
```

3. Start the server:

```bash
npm start
```

## Using Drizzle Studio

View and manage your database with Drizzle Studio:

```bash
npm run db:studio
```

This opens a web interface at `https://local.drizzle.studio`

## Next Steps

- Explore the [API documentation](README.md#api-endpoints)
- Set up job alerts and notifications
- Configure retry policies for critical jobs
- Implement job dependencies for workflows
- Monitor system metrics and performance

## Troubleshooting

### Docker Issues

#### "Database connection failed"

```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

#### "Port already in use"

```bash
# Check what's using port 3000
netstat -ano | findstr :3000   # Windows
lsof -i :3000                  # Mac/Linux

# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead
```

#### "Container won't start"

```bash
# View detailed logs
docker-compose logs --tail=100 job-scheduler

# Remove and recreate
docker-compose down
docker-compose up -d --force-recreate
```

### Database Issues

### "Database connection failed"

- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure the database exists

### "Scheduler not starting"

- Check logs in `logs/scheduler-*.log`
- Verify database schema is up to date
- Check for port conflicts

### Jobs not executing

- Verify job status is ACTIVE
- Check cron expression is valid
- View scheduler logs for errors
  - **Docker**: `docker-compose logs -f job-scheduler | grep scheduler`
  - **Local**: Check `logs/scheduler-*.log`

For more help, check the [Troubleshooting section](README.md#troubleshooting) in the main README.

---

## Docker Production Deployment

### Using Docker Image

```bash
# Build production image
docker build -t job-scheduler:1.0.0 .

# Run with custom configuration
docker run -d \
  --name job-scheduler \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://user:pass@dbhost:5432/db" \
  -e LOG_LEVEL=warn \
  -v /var/log/job-scheduler:/app/logs \
  job-scheduler:1.0.0
```

### Production docker-compose.yml

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - internal

  job-scheduler:
    image: job-scheduler:1.0.0
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      LOG_LEVEL: warn
    ports:
      - "3000:3000"
    volumes:
      - ./logs:/app/logs
    depends_on:
      - postgres
    networks:
      - internal
      - web

volumes:
  postgres_data:

networks:
  internal:
    internal: true
  web:
    external: true
```

### Docker Health Monitoring

The containers include health checks:

```bash
# Check container health
docker ps

# View health check logs
docker inspect job-scheduler-api | grep -A 10 Health

# Force health check
docker exec job-scheduler-api curl -f http://localhost:3000/api/v1/health || exit 1
```

---

## Quick Reference

### Essential Commands

```bash
# Docker
docker-compose up -d           # Start services
docker-compose down            # Stop services
docker-compose logs -f         # View logs
docker-compose ps              # List containers

# Database
npx drizzle-kit push          # Push schema
npx drizzle-kit studio        # Database GUI
npx drizzle-kit generate      # Generate migrations

# Local Development
npm run dev                   # Start dev server
npm run build                 # Build TypeScript
npm start                     # Start production
```

### Common API Endpoints

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Create job
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","schedule":"*/30 * * * * *","api":"https://httpbin.org/get"}'

# List jobs
curl http://localhost:3000/api/v1/jobs

# System metrics
curl http://localhost:3000/api/v1/metrics
```

### Log Locations

**Docker:**

- Mapped to: `./logs` (in project directory)
- Container: `/app/logs`

**Local:**

- Directory: `logs/`
- Files: `all-*.log`, `error-*.log`, `combined-*.log`, etc.

---

## Next Steps

1. ✅ Services are running
2. 📖 Read [API Examples](API_EXAMPLES.md) for detailed usage
3. 📊 Explore [System Metrics](http://localhost:3000/api/v1/metrics)
4. 🔍 Check [Drizzle Studio](https://local.drizzle.studio) for database
5. 📝 Review [Architecture](README.md#architecture) documentation

**Happy Scheduling! 🎉**
