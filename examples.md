# API Examples

This file contains example API requests and responses for the Job Scheduler API.

## Authentication

Currently, the API doesn't require authentication. In production, you should implement proper authentication and authorization.

## Create a Job

### Simple Job (Every 5 minutes)

```bash
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Health Check",
    "schedule": "0 */5 * * * *",
    "api": "https://httpbin.org/status/200",
    "type": "ATLEAST_ONCE"
  }'
```

Response:

```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "ACTIVE",
  "createdAt": "2025-12-28T10:00:00.000Z"
}
```

### Job with Retry Policy

```bash
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Critical API Call",
    "schedule": "0 0 */2 * * *",
    "api": "https://api.example.com/process",
    "type": "ATLEAST_ONCE",
    "timeoutMs": 60000,
    "retryPolicy": {
      "maxRetries": 5,
      "backoffStrategy": "EXPONENTIAL",
      "initialDelayMs": 2000,
      "maxDelayMs": 120000
    },
    "metadata": {
      "priority": "high",
      "department": "finance"
    }
  }'
```

### Job with Rate Limiting

```bash
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rate Limited Job",
    "schedule": "*/10 * * * * *",
    "api": "https://api.example.com/data",
    "type": "ATLEAST_ONCE",
    "maxConcurrentExecutions": 2,
    "rateLimitPerMinute": 10
  }'
```

## Get Job Details

```bash
curl http://localhost:3000/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000
```

Response:

```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Health Check",
  "schedule": "0 */5 * * * *",
  "api": "https://httpbin.org/status/200",
  "type": "ATLEAST_ONCE",
  "status": "ACTIVE",
  "createdAt": "2025-12-28T10:00:00.000Z",
  "updatedAt": "2025-12-28T10:00:00.000Z",
  "nextScheduledRun": "2025-12-28T10:05:00.000Z",
  "metadata": null
}
```

## Update Job

### Change Schedule

```bash
curl -X PUT http://localhost:3000/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "schedule": "0 0 * * * *"
  }'
```

### Pause Job

```bash
curl -X PUT http://localhost:3000/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PAUSED"
  }'
```

### Resume Job

```bash
curl -X PUT http://localhost:3000/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ACTIVE"
  }'
```

## List Jobs

### All Active Jobs

```bash
curl http://localhost:3000/api/v1/jobs?status=ACTIVE
```

### With Pagination

```bash
curl http://localhost:3000/api/v1/jobs?page=1&limit=10&sortBy=createdAt&order=desc
```

Response:

```json
{
  "jobs": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Health Check",
      "schedule": "0 */5 * * * *",
      "apiEndpoint": "https://httpbin.org/status/200",
      "executionType": "ATLEAST_ONCE",
      "status": "ACTIVE",
      "createdAt": "2025-12-28T10:00:00.000Z",
      "updatedAt": "2025-12-28T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

## Get Job Executions

### Last 5 Executions

```bash
curl http://localhost:3000/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000/executions?limit=5
```

### Filter by Status

```bash
curl http://localhost:3000/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000/executions?status=FAILED&limit=10
```

Response:

```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "executions": [
    {
      "id": "exec-123",
      "jobId": "550e8400-e29b-41d4-a716-446655440000",
      "scheduledAt": "2025-12-28T10:00:00.000Z",
      "startedAt": "2025-12-28T10:00:00.100Z",
      "completedAt": "2025-12-28T10:00:02.250Z",
      "status": "SUCCESS",
      "httpStatusCode": 200,
      "executionDurationMs": 2150,
      "retryCount": 0,
      "errorMessage": null
    }
  ]
}
```

## Get Execution Details

```bash
curl http://localhost:3000/api/v1/executions/exec-123
```

Response:

```json
{
  "id": "exec-123",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "scheduledAt": "2025-12-28T10:00:00.000Z",
  "startedAt": "2025-12-28T10:00:00.100Z",
  "completedAt": "2025-12-28T10:00:02.250Z",
  "status": "SUCCESS",
  "httpStatusCode": 200,
  "responseBody": "{\"status\":\"ok\"}",
  "errorMessage": null,
  "executionDurationMs": 2150,
  "retryCount": 0,
  "logs": [
    {
      "id": 1,
      "executionId": "exec-123",
      "logLevel": "INFO",
      "message": "Job execution started",
      "timestamp": "2025-12-28T10:00:00.100Z",
      "metadata": {
        "apiEndpoint": "https://httpbin.org/status/200",
        "timeoutMs": 30000
      }
    },
    {
      "id": 2,
      "executionId": "exec-123",
      "logLevel": "INFO",
      "message": "Job execution successful",
      "timestamp": "2025-12-28T10:00:02.250Z",
      "metadata": {
        "statusCode": 200,
        "duration": 2150
      }
    }
  ]
}
```

## Trigger Job Manually

```bash
curl -X POST http://localhost:3000/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000/trigger
```

Response:

```json
{
  "executionId": "exec-456",
  "status": "PENDING",
  "scheduledAt": "2025-12-28T10:30:00.000Z"
}
```

## Get System Metrics

```bash
curl http://localhost:3000/api/v1/metrics
```

Response:

```json
{
  "totalJobs": 150,
  "activeJobs": 120,
  "pausedJobs": 25,
  "totalExecutions": 15000,
  "successRate": 98.5,
  "avgExecutionTimeMs": 1850,
  "executionsLast24h": 4500,
  "failedExecutionsLast24h": 68,
  "currentLoad": {
    "pendingExecutions": 5,
    "runningExecutions": 2
  }
}
```

## Get Job Metrics

```bash
curl http://localhost:3000/api/v1/metrics/jobs/550e8400-e29b-41d4-a716-446655440000
```

Response:

```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "totalExecutions": 500,
  "successfulExecutions": 492,
  "failedExecutions": 8,
  "successRate": 98.4,
  "avgExecutionTimeMs": 1200,
  "lastExecutionStatus": "SUCCESS",
  "lastExecutionAt": "2025-12-28T10:25:00.000Z",
  "avgDelayFromScheduleMs": 45
}
```

## Health Check

```bash
curl http://localhost:3000/api/v1/health
```

Response:

```json
{
  "status": "healthy",
  "timestamp": "2025-12-28T10:30:00.000Z",
  "database": "connected",
  "scheduler": "ACTIVE",
  "uptime": 3600000,
  "instanceId": "scheduler-abc-123"
}
```

## Scheduler Status

```bash
curl http://localhost:3000/api/v1/scheduler/status
```

Response:

```json
{
  "instanceId": "scheduler-abc-123",
  "status": "ACTIVE",
  "jobsProcessedCount": 5000,
  "uptime": 3600000,
  "currentlyRunningJobs": 2,
  "queuedJobs": 5,
  "workerPoolSize": 50,
  "workerPoolUtilization": 4
}
```

## Delete Job

```bash
curl -X DELETE http://localhost:3000/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000
```

Response:

```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "DELETED"
}
```

## Error Responses

### Validation Error

```bash
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invalid Job",
    "schedule": "invalid-cron"
  }'
```

Response (400):

```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "schedule",
      "message": "Invalid cron expression format"
    },
    {
      "field": "api",
      "message": "Required"
    }
  ]
}
```

### Not Found Error

```bash
curl http://localhost:3000/api/v1/jobs/non-existent-id
```

Response (500):

```json
{
  "error": "Job not found"
}
```

## Cron Expression Examples

```bash
# Every 30 seconds
"*/30 * * * * *"

# Every minute
"0 * * * * *"

# Every 5 minutes
"0 */5 * * * *"

# Every hour at minute 0
"0 0 * * * *"

# Every day at 9:00 AM
"0 0 9 * * *"

# Every weekday at 9:00 AM
"0 0 9 * * MON-FRI"

# Every Monday at 9:00 AM
"0 0 9 * * MON"

# First day of every month at midnight
"0 0 0 1 * *"

# Complex: At 10:31 AM, between 10 AM and 3 PM, on weekdays
"0 31 10-15 * * MON-FRI"
```
