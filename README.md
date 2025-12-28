# Job Scheduler API

A production-ready Node.js job scheduler application built with TypeScript, Express, Drizzle ORM, and PostgreSQL. Features include cron-based scheduling, at-least-once execution semantics, comprehensive logging with Winston, retry policies, and full observability.

## Features

- ✅ **Cron-based Scheduling** - Support for cron expressions with seconds precision
- ✅ **At-least-once Execution** - Guaranteed job execution semantics
- ✅ **Retry Policies** - Configurable retry strategies (exponential, linear, fixed backoff)
- ✅ **Comprehensive Logging** - Winston-based logging with daily rotation and separate files
- ✅ **Health Monitoring** - Health check and scheduler status endpoints
- ✅ **Metrics & Observability** - System-wide and per-job metrics
- ✅ **Dead Letter Queue** - Failed job tracking and management
- ✅ **Audit Trail** - Complete history of job changes
- ✅ **Job Dependencies** - Support for job workflows
- ✅ **Alerts** - Webhook/Email/Slack notifications for job failures

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Getting Started

### Option 1: Docker Deployment (Recommended)

The easiest way to get started is using Docker Compose, which sets up both the application and PostgreSQL database:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f job-scheduler

# Stop all services
docker-compose down

# Stop and remove volumes (cleans database)
docker-compose down -v
```

The application will be available at `http://localhost:3000` with PostgreSQL running on port `5432`.

**Database Credentials (Docker):**

- Username: `jobscheduler`
- Password: `jobscheduler_password`
- Database: `job_scheduler`

After starting, push the database schema:

```bash
# Install drizzle-kit globally or use npx
npx drizzle-kit push --config=./drizzle.config.ts
```

### Option 2: Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Update the `DATABASE_URL` in your `.env` file:

```
DATABASE_URL="postgresql://username:password@localhost:5432/job_scheduler"
```

### 3. Set Up Drizzle

Generate migrations:

```bash
npm run db:generate
```

Push schema to database:

```bash
npm run db:push
```

Or run migrations:

```bash
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Docker Deployment

### Using Docker Compose (Recommended)

The project includes a complete Docker Compose setup with PostgreSQL:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

**What's included:**

- Job Scheduler API (Port 3000)
- PostgreSQL 16 (Port 5432)
- Persistent database storage
- Health checks for both services
- Auto-restart on failure

### Building Docker Image Manually

```bash
# Build the image
docker build -t job-scheduler:latest .

# Run with custom environment
docker run -d \
  --name job-scheduler \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e NODE_ENV=production \
  -e LOG_LEVEL=info \
  -v $(pwd)/logs:/app/logs \
  job-scheduler:latest
```

### Docker Environment Variables

Configure these in `docker-compose.yml` or pass via `-e`:

```env
NODE_ENV=production           # Environment mode
PORT=3000                     # Server port
DATABASE_URL=postgresql://... # Database connection string
LOG_LEVEL=info               # Logging level (error, warn, info, debug)
```

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Job Scheduler API                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │  Controllers │─────▶│   Services   │─────▶│ Database  │ │
│  │  (HTTP Layer)│      │ (Logic Layer)│      │ (Drizzle) │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│         │                                           │         │
│         │               ┌──────────────┐           │         │
│         └──────────────▶│  Middleware  │           │         │
│                         │ (Error/Logs) │           │         │
│                         └──────────────┘           │         │
│                                                     │         │
│  ┌────────────────────────────────────────────────┼─────┐   │
│  │         Scheduler Engine (Background)          │     │   │
│  │  ┌──────────────┐      ┌─────────────────┐   │     │   │
│  │  │ Job Picker   │─────▶│  Job Executor   │───┘     │   │
│  │  │ (Cron Parser)│      │ (HTTP Client)   │         │   │
│  │  └──────────────┘      └─────────────────┘         │   │
│  │         │                       │                    │   │
│  │         ▼                       ▼                    │   │
│  │  [Execution Queue]      [Retry Handler]            │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    │   Database       │
                    └──────────────────┘
```

### Layered Architecture

#### 1. **API Layer** (Controllers)

- Handles HTTP requests and responses
- Input validation using Zod schemas
- Maps domain objects to DTOs
- Error handling and response formatting

#### 2. **Business Logic Layer** (Services)

- `JobService` - Job CRUD operations
- `ExecutionService` - Metrics and execution tracking
- Database queries using Drizzle ORM
- Business rule enforcement

#### 3. **Data Access Layer** (Drizzle ORM)

- Type-safe database queries
- Connection pooling (max 20 connections)
- Transaction management
- Schema migrations

#### 4. **Scheduler Engine** (Background Service)

- **Job Picker**: Polls database every 10 seconds for scheduled jobs
- **Job Executor**: Executes HTTP calls with timeout and retry logic
- **Heartbeat Manager**: Updates scheduler metadata every 30 seconds
- Graceful shutdown handling

#### 5. **Middleware Layer**

- **Error Middleware**: Global error handling and formatting
- **Logging Middleware**: Request/response logging with Winston
- **Validation**: Zod schema validation

### Component Interaction Flow

#### Job Creation Flow

```
Client → POST /api/v1/jobs
   ↓
JobController.createJob()
   ↓
Zod Validation (createJobSchema)
   ↓
JobService.createJob()
   ↓
[Validate cron expression]
   ↓
Database INSERT (jobs table)
   ↓
JobAuditLog INSERT
   ↓
Response → { jobId, status, createdAt }
```

#### Job Execution Flow

```
Scheduler Engine (Every 10s)
   ↓
JobPicker.pickAndScheduleJobs()
   ↓
[Parse cron expression for each active job]
   ↓
[Check if execution time has arrived]
   ↓
Create JobExecution record (PENDING)
   ↓
JobExecutor.executeJob()
   ↓
Update status to RUNNING
   ↓
HTTP Request to API endpoint (with timeout)
   ↓
Log execution details
   ↓
Update status to SUCCESS/FAILED
   ↓
[If FAILED] → Retry Logic or Dead Letter Queue
```

### Data Flow

```
┌──────────────────────────────────────────────────────────┐
│                     Request Flow                          │
└──────────────────────────────────────────────────────────┘
   HTTP Request
      ↓
   Express Router
      ↓
   Logging Middleware (Start timer)
      ↓
   Controller (Validation)
      ↓
   Service (Business Logic)
      ↓
   Drizzle ORM (Database Query)
      ↓
   PostgreSQL
      ↓
   Response
      ↓
   Error Middleware (If error occurs)
      ↓
   Logging Middleware (Log duration)
      ↓
   HTTP Response

┌──────────────────────────────────────────────────────────┐
│                   Background Flow                         │
└──────────────────────────────────────────────────────────┘
   Scheduler Engine Timer (10s)
      ↓
   Query Active Jobs
      ↓
   Parse Cron Expressions
      ↓
   Create Execution Records
      ↓
   Execute HTTP Calls (Async)
      ↓
   Update Execution Status
      ↓
   Log to JobExecutionLogs
      ↓
   [On Failure] → Retry or DLQ
```

### Database Schema Design

The database uses a normalized relational schema optimized for:

- Fast job lookups (indexed by status)
- Efficient execution history queries (indexed by job_id + completed_at)
- Audit trail tracking (indexed by job_id + timestamp)
- Metrics calculation (aggregation queries)

**Key Relationships:**

- `jobs` → `job_executions` (1:N)
- `job_executions` → `job_execution_logs` (1:N)
- `jobs` → `job_audit_log` (1:N)
- `jobs` → `job_alerts` (1:N)
- `jobs` → `job_dependencies` (M:N self-reference)
- `jobs` → `job_tags` (M:N through job_tag_associations)

### Logging Architecture

**Winston Logger Configuration:**

- **5 Separate Log Files** with daily rotation
- **Context-aware loggers** for different components
- **Automatic cleanup** based on retention policies

```
Logger Hierarchy:
├── Main Logger (logger.ts)
│   ├── All logs → logs/all-*.log
│   ├── Errors → logs/error-*.log
│   └── Combined → logs/combined-*.log
│
├── Execution Logger
│   └── Job executions → logs/executions-*.log
│
└── Scheduler Logger
    └── Scheduler events → logs/scheduler-*.log
```

### Retry Strategy

```
Job Execution Failed
   ↓
Check retryPolicy exists?
   ↓ (Yes)
Check retryCount < maxRetries?
   ↓ (Yes)
Calculate delay based on strategy:
   - EXPONENTIAL: delay = initial * 2^retryCount
   - LINEAR: delay = initial * (retryCount + 1)
   - FIXED: delay = initial
   ↓
Cap at maxDelayMs
   ↓
Update status to RETRYING
   ↓
Schedule retry after delay
   ↓ (No more retries)
Move to Dead Letter Queue
```

## Implementation Details

### Key Technologies & Versions

- **Runtime**: Node.js 20 (LTS)
- **Language**: TypeScript 5.x
- **Web Framework**: Express 5.x
- **ORM**: Drizzle ORM 0.45+
- **Database**: PostgreSQL 16
- **Logging**: Winston 3.x with daily rotation
- **Validation**: Zod 4.x
- **Cron Parser**: cron-parser 4.x
- **HTTP Client**: Axios 1.x

### Performance Considerations

1. **Database Connection Pooling**

   - Max 20 connections
   - 30-second idle timeout
   - 2-second connection timeout

2. **Scheduler Efficiency**

   - 10-second polling interval (configurable)
   - Non-blocking async execution
   - Heartbeat every 30 seconds

3. **Log Management**

   - Daily rotation prevents disk bloat
   - 14-30 day retention policies
   - Separate files for performance

4. **Memory Management**
   - Response body limited to 5000 chars in database
   - Log output truncated at 60KB
   - Streaming responses where applicable

### Security Features

- ✅ **Input Validation**: Zod schemas for all endpoints
- ✅ **SQL Injection Protection**: Drizzle ORM parameterized queries
- ✅ **Error Sanitization**: Production errors hide internal details
- ✅ **Non-root Docker User**: Runs as nodejs user (UID 1001)
- ✅ **Health Checks**: Docker health checks for monitoring
- ⚠️ **Authentication**: Not implemented (add for production)
- ⚠️ **Rate Limiting**: Not implemented (add for production)
- ⚠️ **CORS**: Not configured (add for production)

### Scalability Considerations

**Current Design** (Single Instance):

- In-memory scheduling
- Direct database polling
- Suitable for: <1000 jobs, <10 executions/second

**For High Scale** (Future Enhancements):

- Redis-based job queue
- Multiple scheduler instances with leader election
- Horizontal scaling with load balancer
- Separate execution workers
- Message queue (RabbitMQ/Kafka) for events

## Available Scripts

## Project Structure

## Project Structure

```
job-scheduler/
├── src/
│   ├── config/
│   │   ├── database.ts         # Database connection & pool
│   │   └── logger.ts           # Winston logger configuration
│   ├── controllers/
│   │   ├── job.controller.ts   # Job management endpoints
│   │   ├── execution.controller.ts  # Execution tracking
│   │   └── health.controller.ts     # Health & status checks
│   ├── services/
│   │   ├── job.service.ts      # Job business logic
│   │   └── execution.service.ts     # Execution & metrics logic
│   ├── routes/
│   │   ├── index.ts            # Route aggregator
│   │   ├── job.routes.ts       # Job API routes
│   │   ├── execution.routes.ts # Execution API routes
│   │   ├── metrics.routes.ts   # Metrics API routes
│   │   └── health.routes.ts    # Health check routes
│   ├── middleware/
│   │   ├── error.middleware.ts # Error handling
│   │   └── logging.middleware.ts    # Request logging
│   ├── scheduler/
│   │   ├── scheduler-engine.ts # Main scheduler engine
│   │   └── job-executor.ts     # Job execution logic
│   ├── validators/
│   │   └── schemas.ts          # Zod validation schemas
│   ├── db/
│   │   ├── schema.ts           # Drizzle database schema
│   │   └── index.ts            # Database exports
│   └── index.ts                # Application entry point
├── logs/                       # Log files (auto-generated)
│   ├── all-YYYY-MM-DD.log     # All logs
│   ├── error-YYYY-MM-DD.log   # Error logs only
│   ├── combined-YYYY-MM-DD.log # Info and above
│   ├── executions-YYYY-MM-DD.log # Job execution logs
│   └── scheduler-YYYY-MM-DD.log  # Scheduler logs
├── drizzle/                    # Migration files (auto-generated)
├── dist/                       # Compiled JavaScript
├── .env                        # Environment variables
├── drizzle.config.ts          # Drizzle configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies
└── nodemon.json               # Nodemon configuration
```

## API Endpoints

### Job Management

#### Create Job

```http
POST /api/v1/jobs
Content-Type: application/json

{
  "name": "Daily Report Generator",
  "schedule": "31 10-15 1 * * MON-FRI",
  "api": "https://api.example.com/reports",
  "type": "ATLEAST_ONCE",
  "timeoutMs": 30000,
  "retryPolicy": {
    "maxRetries": 3,
    "backoffStrategy": "EXPONENTIAL",
    "initialDelayMs": 1000,
    "maxDelayMs": 60000
  }
}
```

#### Get Job

```http
GET /api/v1/jobs/:jobId
```

#### Update Job

```http
PUT /api/v1/jobs/:jobId
Content-Type: application/json

{
  "schedule": "0 */5 * * * *",
  "status": "PAUSED"
}
```

#### Delete Job

```http
DELETE /api/v1/jobs/:jobId
```

#### List Jobs

```http
GET /api/v1/jobs?status=ACTIVE&page=1&limit=20&sortBy=createdAt&order=desc
```

#### Get Job Executions

```http
GET /api/v1/jobs/:jobId/executions?limit=5&status=SUCCESS
```

#### Trigger Job Manually

```http
POST /api/v1/jobs/:jobId/trigger
```

### Execution Tracking

#### Get Execution Details

```http
GET /api/v1/executions/:executionId
```

### Metrics & Monitoring

#### System Metrics

```http
GET /api/v1/metrics
```

Response:

```json
{
  "totalJobs": 1500,
  "activeJobs": 1200,
  "pausedJobs": 250,
  "totalExecutions": 150000,
  "successRate": 98.5,
  "avgExecutionTimeMs": 1850,
  "executionsLast24h": 45000,
  "failedExecutionsLast24h": 680,
  "currentLoad": {
    "pendingExecutions": 45,
    "runningExecutions": 12
  }
}
```

#### Job-Specific Metrics

```http
GET /api/v1/metrics/jobs/:jobId
```

### Health & Status

#### Health Check

```http
GET /api/v1/health
```

#### Scheduler Status

```http
GET /api/v1/scheduler/status
```

## Database Schema

The application uses the following database tables:

### Core Tables

- **jobs** - Job definitions and configurations
- **job_executions** - Execution history and status
- **job_execution_logs** - Detailed execution logs
- **scheduler_metadata** - Scheduler instance tracking

### Additional Tables

- **job_alerts** - Alert configurations (webhooks, email, Slack)
- **job_tags** - Job categorization
- **job_tag_associations** - Job-tag relationships
- **job_dependencies** - Job dependency definitions
- **job_audit_log** - Audit trail for all job changes
- **failed_jobs_dlq** - Dead letter queue for failed jobs

## Logging

The application uses Winston for comprehensive logging with the following structure:

### Log Files

- `logs/all-YYYY-MM-DD.log` - All log levels
- `logs/error-YYYY-MM-DD.log` - Error logs only (30-day retention)
- `logs/combined-YYYY-MM-DD.log` - Info and above (14-day retention)
- `logs/executions-YYYY-MM-DD.log` - Job execution specific logs
- `logs/scheduler-YYYY-MM-DD.log` - Scheduler engine logs

### Log Levels

- `error` - Error events
- `warn` - Warning events
- `info` - Informational messages
- `debug` - Debug information
- `verbose` - Verbose information

### Context-aware Logging

```typescript
import { createLogger } from "./config/logger";

const logger = createLogger("MyService");
logger.info("Message", { metadata });
```

## Technologies Used

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express** - Web framework
- **Drizzle ORM** - Modern TypeScript ORM
- **PostgreSQL** - Relational database
- **Winston** - Comprehensive logging with daily rotation
- **node-cron** - Cron expression parser
- **Axios** - HTTP client for API calls
- **Zod** - Runtime type validation
- **UUID** - Unique identifier generation
- **Nodemon** - Development auto-restart

## Architecture Highlights

### Layered Architecture

- **Controllers** - Handle HTTP requests/responses
- **Services** - Business logic and data access
- **Middleware** - Request processing and error handling
- **Scheduler** - Background job scheduling and execution

### Scheduler Engine

- Polls for jobs based on cron schedules
- Executes jobs with configurable timeouts
- Supports retry policies with multiple backoff strategies
- Tracks execution metrics and logs
- Handles graceful shutdown

### Error Handling

- Global error handler with custom error types
- Zod validation errors with detailed messages
- Comprehensive error logging
- Dead letter queue for permanently failed jobs

## Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/job_scheduler"

# Server
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=info
```

## Development

### Code Structure

Follow the existing patterns:

- Services handle business logic
- Controllers handle HTTP layer
- Use context-aware loggers
- Validate inputs with Zod schemas
- Use TypeScript types from Drizzle schema

### Adding New Features

1. Define schema in `src/db/schema.ts`
2. Create service in `src/services/`
3. Create controller in `src/controllers/`
4. Add routes in `src/routes/`
5. Update route index

## Production Considerations

1. **Database Connection Pooling** - Configured with max 20 connections
2. **Log Rotation** - Automatic daily rotation with retention policies
3. **Graceful Shutdown** - Handles SIGINT/SIGTERM properly
4. **Health Checks** - Monitor database and scheduler status
5. **Error Handling** - Comprehensive error capture and logging
6. **Retry Logic** - Configurable retry policies with backoff
7. **Dead Letter Queue** - Track permanently failed jobs
8. **Audit Trail** - Complete history of job changes

## Troubleshooting

### Database Connection Issues

- Check `DATABASE_URL` in `.env`
- Verify PostgreSQL is running
- Check logs in `logs/error-*.log`

### Jobs Not Executing

- Check scheduler status: `GET /api/v1/scheduler/status`
- Verify job status is `ACTIVE`
- Check `logs/scheduler-*.log` for errors

### High Error Rates

- Check `logs/error-*.log` for patterns
- Review job metrics: `GET /api/v1/metrics/jobs/:jobId`
- Check dead letter queue in database

## Next Steps

1. Configure your PostgreSQL database connection in `.env`
2. Run `npm run db:push` to create database schema
3. Start the server with `npm run dev`
4. Create your first job via `POST /api/v1/jobs`
5. Monitor execution in logs and via metrics endpoints

## License

ISC
