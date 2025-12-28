# Job Scheduler Tests

Comprehensive test suite for the Job Scheduler API using Jest and Supertest.

## Test Structure

```
src/__tests__/
├── setup.ts              # Test environment configuration
├── jobs.test.ts          # Job API endpoint tests
├── executions.test.ts    # Execution API endpoint tests
├── metrics.test.ts       # Metrics API endpoint tests
└── health.test.ts        # Health check API tests
```

## Running Tests

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with verbose output
npm run test:verbose

# Run tests silently
npm run test:silent
```

## Test Coverage

The test suite covers:

### Job API (`jobs.test.ts`)

- ✅ Create job with valid data
- ✅ Create job with retry policy
- ✅ List jobs with pagination
- ✅ Filter jobs by status
- ✅ Get job by ID
- ✅ Update job
- ✅ Delete job (soft delete)
- ✅ Pause job
- ✅ Resume job
- ✅ Get job executions
- ✅ Trigger job manually
- ✅ Validation errors for invalid input

### Execution API (`executions.test.ts`)

- ✅ Get execution by ID
- ✅ Get execution logs
- ✅ List recent executions
- ✅ Filter executions by status
- ✅ Limit number of results
- ✅ Status validation

### Metrics API (`metrics.test.ts`)

- ✅ Get system metrics
- ✅ Numeric value validation
- ✅ Non-negative values
- ✅ Logical relationships (activeJobs <= totalJobs)
- ✅ Success/failure rate calculations

### Health Check API (`health.test.ts`)

- ✅ Get health status
- ✅ Database connection status
- ✅ Scheduler status
- ✅ Uptime reporting
- ✅ Response time validation
- ✅ Required fields validation

## Test Configuration

Tests use:

- **Jest** - Testing framework
- **Supertest** - HTTP assertions
- **ts-jest** - TypeScript support
- **Mocked services** - Isolated unit tests

## Environment

Tests run against a test database to avoid polluting production data:

- Database: `job_scheduler_test`
- Port: `3001`
- Log Level: `error` (reduced noise)

## Coverage Reports

After running tests, coverage reports are available in:

- `coverage/` - HTML coverage report
- `coverage/lcov.info` - LCOV format for CI/CD

View HTML coverage:

```bash
npm test
# Open coverage/index.html in browser
```

## Continuous Integration

Tests are designed to run in CI/CD pipelines:

- Fast execution
- Isolated test environment
- Comprehensive assertions
- Clear error messages

## Best Practices

1. **Mock external dependencies** - Database and services are mocked
2. **Test isolation** - Each test is independent
3. **Clear assertions** - Descriptive expect statements
4. **Edge cases** - Invalid inputs, missing data, etc.
5. **Performance** - Response time validations
