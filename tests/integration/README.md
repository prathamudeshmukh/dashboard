# Integration Tests

Integration tests for the Templify dashboard API. These tests validate the interaction between API routes, database operations, and external service integrations in an isolated test environment.

## Quick Start

```bash
# 1. Start test database
docker-compose -f docker-compose.test.yml up -d

# 2. Configure environment
cp .env.test.example .env.test

# 3. Run migrations
npm run db:migrate:test

# 4. Run tests
npm run test:integration
```

## Prerequisites

- Docker and Docker Compose (for test database)
- Node.js 18+ and npm
- PostgreSQL client tools (optional, for manual database inspection)

## Setup Instructions

### 1. Test Database Setup

**Using Docker Compose (Recommended):**

```bash
# Start PostgreSQL test database
docker-compose -f docker-compose.test.yml up -d

# Check database status
docker-compose -f docker-compose.test.yml ps

# View logs
docker-compose -f docker-compose.test.yml logs -f postgres-test

# Stop database
docker-compose -f docker-compose.test.yml down

# Stop and remove volumes (complete cleanup)
docker-compose -f docker-compose.test.yml down -v
```

**Using Local PostgreSQL:**

```bash
# Create test database
createdb templify_test

# Or using psql
psql -U postgres -c "CREATE DATABASE templify_test;"

# Update .env.test with your connection string
# DATABASE_URL_TEST=postgresql://your-user:password@localhost:5432/templify_test
```

### 2. Environment Configuration

```bash
# Copy example environment file
cp .env.test.example .env.test

# Edit .env.test with your values
# The defaults should work with docker-compose.test.yml
```

**Required environment variables:**
- `DATABASE_URL_TEST` - PostgreSQL connection string for test database
- `JOB_RUNNER_BASE_URL` - Mock job-runner URL (default: http://localhost:3001)
- `JOB_RUNNER_TOKEN` - Test authentication token
- `ENCRYPTION_KEY` - Test encryption key (must be 32+ characters)

### 3. Database Migrations

```bash
# Run migrations on test database
npm run db:migrate:test

# Reset test database (drops all tables)
npm run db:reset:test
```

## Running Tests

```bash
# Run all integration tests
npm run test:integration

# Run tests in watch mode
npm run test:integration:watch

# Run tests with UI
npm run test:integration:ui

# Run tests with coverage
npm run test:integration:coverage

# Run unit and integration tests
npm run test:all
```

## Project Structure

```
tests/integration/
├── setup.ts                 # Global test setup & teardown
├── setup.test.ts           # Database setup validation tests
├── fixtures/               # Test data factories (Phase 3)
│   ├── test-users.ts
│   └── test-templates.ts
├── helpers/                # Test utilities (Phase 3)
│   ├── test-helpers.ts
│   └── auth-helpers.ts
├── mocks/                  # Mock services (Phase 2)
│   ├── mock-job-runner.ts
│   ├── mock-inngest.ts
│   └── mock-blob.ts
└── convert-api/            # API integration tests
    └── example.test.ts     # Example test (Phase 4)
```

## Current Status (Phase 1 Complete)

✅ **Implemented:**
- Test database setup with isolation
- Database cleanup utilities
- Environment variable validation
- Vitest configuration for integration tests
- Docker Compose test database
- NPM scripts for test execution
- Database migration scripts

🚧 **Coming Next:**
- Phase 2: Mock service layer (job-runner, Inngest, Blob)
- Phase 3: Test fixtures and helpers
- Phase 4: Example integration test
- Phase 5: CI/CD integration

## Test Database

The test database is completely separate from development/production databases:

- **Port**: 5433 (vs 5432 for dev)
- **Database**: `templify_test`
- **User**: `test` / `test`
- **Connection**: `postgresql://test:test@localhost:5433/templify_test`

### Database Cleanup

Integration tests automatically clean the database:
- **Before tests**: Initial cleanup to ensure clean slate
- **After tests**: Final cleanup to remove test data

Manual cleanup:
```bash
# Reset database completely
npm run db:reset:test

# Then re-run migrations
npm run db:migrate:test
```

## Troubleshooting

### Database Connection Errors

```bash
# Check if database is running
docker-compose -f docker-compose.test.yml ps

# Restart database
docker-compose -f docker-compose.test.yml restart

# Check logs for errors
docker-compose -f docker-compose.test.yml logs postgres-test
```

### Port Already in Use

If port 5433 is already in use:
1. Edit `docker-compose.test.yml` and change the port mapping
2. Update `DATABASE_URL_TEST` in `.env.test`

### Migration Errors

```bash
# Reset database and re-run migrations
npm run db:reset:test
npm run db:migrate:test
```

### Environment Variable Errors

Tests will fail with clear error messages if required environment variables are missing:
```
Missing required environment variable: DATABASE_URL_TEST
Please copy .env.test.example to .env.test and fill in the values.
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Use database cleanup between tests
3. **Realistic Data**: Create test data that mirrors production
4. **Fast Tests**: Keep tests under 10 seconds each
5. **Clear Assertions**: Use descriptive error messages

## Next Steps

After Phase 1, proceed with:
1. **Phase 2**: Set up mock services (job-runner, Inngest, Blob)
2. **Phase 3**: Create test fixtures and helper utilities
3. **Phase 4**: Write example integration test
4. **Phase 5**: Set up CI/CD pipeline

See the [implementation plan](../../.github/stories-and-plans/implementation-plans/implementation_plan_integration_test_infrastructure.md) for complete details.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Drizzle ORM Testing](https://orm.drizzle.team/docs/guides/testing)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
