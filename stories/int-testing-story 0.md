# Story 0: Setup Integration Test Infrastructure

## Business Context

Integration tests are critical for protecting customer workflows from regressions, but they require dedicated infrastructure that is separate from unit tests and E2E tests. Currently, the project has Vitest configured for unit tests and Playwright for E2E tests, but lacks the infrastructure needed for integration testing that validates API routes, database interactions, and external service integrations.

Without proper integration test infrastructure, the team cannot write comprehensive tests for the convert API and other critical business logic. This story establishes the foundational infrastructure required to enable Stories 1-4 (regression test coverage for the convert API).

This is a technical enablement story that unlocks the ability to deliver automated regression prevention, ultimately allowing faster feature releases with confidence.

## Story Text

**As a** Developer  
**I want** integration test infrastructure set up with a working example test  
**So that** I can write integration tests for the convert API and protect customer workflows from regressions

## Acceptance Criteria

### AC1: Test Database Setup
**Given** the need for isolated integration testing  
**When** integration tests run  
**Then** a separate test database is provisioned and accessible  
**And** the test database connection string is configured via `DATABASE_URL_TEST` environment variable  
**And** test database migrations are applied automatically before tests run  
**And** test database is isolated from dev/staging/prod databases  
**And** database state is cleaned between test runs (via transactions or truncation)

### AC2: Integration Test Directory Structure
**Given** the project needs organized integration tests  
**When** the integration test infrastructure is set up  
**Then** a integration directory exists with the following structure:
```
tests/
└── integration/
    ├── setup.ts              # Global test setup
    ├── fixtures/
    │   ├── test-users.ts     # User creation helpers
    │   ├── test-templates.ts # Template creation helpers
    │   └── test-helpers.ts   # Shared utilities
    ├── mocks/
    │   ├── mock-job-runner.ts   # Mock job-runner HTTP server
    │   ├── mock-inngest.ts      # Mock Inngest client
    │   └── mock-blob.ts         # Mock Vercel Blob
    └── convert-api/
        └── example.test.ts      # Example working test
```
**And** this structure is documented in a README

### AC3: Mock Job-Runner Service
**Given** integration tests need to mock the job-runner service  
**When** tests are executed  
**Then** a mock HTTP server is available that simulates job-runner endpoints  
**And** the mock supports `POST /generate-pdf` returning mock PDF bytes  
**And** the mock validates authorization headers are present  
**And** the mock allows tests to verify request payloads (HTML content)  
**And** the mock can be configured to return errors for testing failure scenarios  
**And** tests can verify the mock was called with expected parameters

### AC4: Mock Inngest Client
**Given** integration tests need to mock Inngest event sending  
**When** tests trigger async workflows  
**Then** Inngest event sending is mocked/stubbed  
**And** tests can verify events were sent with correct event names  
**And** tests can verify event payloads contain expected data  
**And** actual Inngest functions are NOT executed during integration tests  
**And** the mock provides a helper to assert events were sent

### AC5: Mock Vercel Blob Storage
**Given** integration tests need to mock blob storage  
**When** tests upload or download files  
**Then** Vercel Blob operations are mocked  
**And** `put()` operations return mock URLs  
**And** `del()` operations succeed without actual deletion  
**And** the mock tracks uploaded files for verification  
**And** tests can assert blobs were uploaded with expected content

### AC6: Base Test Fixtures
**Given** integration tests need reusable test data  
**When** the infrastructure is set up  
**Then** test fixture helpers exist for:
  - Creating test users with API credentials
  - Creating test templates (dev and prod)
  - Generating valid templateData payloads
  - Cleaning up test data after tests
**And** fixtures use database transactions for isolation  
**And** fixtures are typed with TypeScript  
**And** fixtures are documented with usage examples

### AC7: Test Helper Utilities
**Given** integration tests need shared assertion helpers  
**When** the infrastructure is set up  
**Then** helper utilities exist for:
  - Making authenticated API requests
  - Asserting error response formats
  - Asserting database state changes
  - Verifying mock service calls
  - Waiting for async operations
**And** helpers are reusable across all integration tests  
**And** helpers provide clear error messages on assertion failures

### AC8: Example Working Test
**Given** the infrastructure is complete  
**When** an example integration test is run  
**Then** the test successfully:
  - Creates a test user and template in the test database
  - Calls the convert API with authentication
  - Mocks the job-runner service to return PDF bytes
  - Asserts the response is a valid PDF
  - Verifies database records were created
  - Cleans up all test data
**And** the test passes consistently  
**And** the test demonstrates all infrastructure components working together  
**And** the test serves as a template for Stories 1-4

### AC9: Vitest Configuration for Integration Tests
**Given** integration tests have different requirements than unit tests  
**When** Vitest is configured  
**Then** a separate test configuration exists for integration tests  
**And** integration tests use the test database connection  
**And** integration tests have appropriate timeouts (e.g., 30s per test)  
**And** integration tests can be run independently: `npm run test:integration`  
**And** integration tests are excluded from unit test runs  
**And** test coverage reporting is configured for integration tests

### AC10: GitHub Actions Workflow
**Given** integration tests need to run in CI/CD  
**When** a pull request is created  
**Then** a GitHub Actions workflow runs integration tests  
**And** the workflow provisions a test database (e.g., PostgreSQL service)  
**And** the workflow sets up required environment variables  
**And** the workflow runs database migrations  
**And** the workflow executes integration tests via `npm run test:integration`  
**And** test failures block PR merging  
**And** test results are reported in the PR status checks  
**And** the workflow is documented in `.github/workflows/integration-tests.yml`

### AC11: Environment Configuration
**Given** integration tests need specific environment variables  
**When** tests are configured  
**Then** a `.env.test.example` file documents required variables:
  - `DATABASE_URL_TEST` - Test database connection
  - `JOB_RUNNER_BASE_URL` - Mock job-runner URL (localhost)
  - `JOB_RUNNER_TOKEN` - Test token
  - `ENCRYPTION_KEY` - Test encryption key
  - Other required variables for testing
**And** tests validate required environment variables are present  
**And** missing variables cause tests to fail fast with clear errors  
**And** environment variables are loaded from `.env.test` for local testing

### AC12: Documentation
**Given** developers need to understand the integration test infrastructure  
**When** the infrastructure is set up  
**Then** a README.md exists that documents:
  - How to set up the test database locally
  - How to run integration tests (`npm run test:integration`)
  - How to write new integration tests
  - How the mock services work
  - How to use fixtures and helpers
  - Troubleshooting common issues
**And** the main project README is updated with integration test instructions  
**And** code examples are provided for common test scenarios

### NFR1: Test Execution Speed
**Given** integration tests will be run frequently  
**When** the example test runs  
**Then** test setup (database seeding, mocks) completes in under 5 seconds  
**And** the example test executes in under 10 seconds  
**And** test cleanup is fast and doesn't block subsequent tests  
**And** the infrastructure supports parallel test execution

### NFR2: Test Isolation
**Given** integration tests may run in parallel  
**When** multiple tests execute  
**Then** each test is completely isolated from others  
**And** database transactions or cleanup prevent data pollution  
**And** tests can run in any order without affecting each other  
**And** failed tests don't leave residual state

### NFR3: Developer Experience
**Given** developers will write integration tests  
**When** using the infrastructure  
**Then** setup is documented and straightforward  
**And** error messages are clear and actionable  
**And** debugging is supported (tests can be run individually)  
**And** the example test provides a clear template to follow  
**And** IDE integration works (e.g., running tests from VS Code)

## Out of Scope

- Writing actual convert API integration tests (covered in Stories 1-4)
- E2E tests using real external services (Playwright handles E2E)
- Load testing or performance testing infrastructure
- Test data generation beyond basic fixtures
- Advanced mock scenarios (just basic mocking needed to validate infrastructure)
- Monitoring or observability for test runs (basic pass/fail is sufficient)
- Test reporting dashboards (GitHub Actions status checks are sufficient)

## Dependencies

- **None** - This is the foundational story that enables Stories 1-4

## Assumptions

- PostgreSQL is used for the test database (same as production)
- Test database can be provisioned locally (via Docker or local Postgres)
- GitHub Actions has access to provision PostgreSQL service containers
- Vitest is the chosen testing framework (already configured for unit tests)
- Mocks can use libraries like `msw` (Mock Service Worker) or simple HTTP mocks
- Test database can be cleaned between runs (truncate tables or rollback transactions)
- Environment variables are managed via `.env.test` locally
- Encryption key for tests can be a static value (not production secret)
- Test users and API credentials can be generated dynamically
- Integration tests will NOT call real external services (job-runner, Inngest, Blob, OpenAI)
- Tests run sequentially in CI to avoid database contention (can optimize later)

## Supporting Documentation

### Test Database Setup (Local Development)

**Option 1: Docker Compose**
```yaml
# docker-compose.test.yml
services:
  postgres-test:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: templify_test
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    ports:
      - "5433:5432"
```

**Option 2: Local PostgreSQL**
```bash
createdb templify_test
DATABASE_URL_TEST=postgresql://user:pass@localhost:5432/templify_test
```

### Example Test Structure

```typescript
// tests/integration/convert-api/example.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createTestUser, createTestTemplate, cleanupTestData } from '../fixtures/test-users';
import { startMockJobRunner, stopMockJobRunner } from '../mocks/mock-job-runner';
import { POST } from '@/app/[locale]/convert/[templateId]/route';

describe('Convert API - Example Integration Test', () => {
  let testUser: any;
  let testTemplate: any;
  let mockJobRunner: any;

  beforeAll(async () => {
    // Start mock services
    mockJobRunner = await startMockJobRunner();
  });

  afterAll(async () => {
    // Stop mock services
    await stopMockJobRunner(mockJobRunner);
  });

  beforeEach(async () => {
    // Create test data
    testUser = await createTestUser();
    testTemplate = await createTestTemplate(testUser.email);
  });

  afterEach(async () => {
    // Cleanup test data
    await cleanupTestData();
  });

  it('should generate PDF successfully with valid authentication', async () => {
    // Arrange
    const request = new Request(`http://localhost/convert/${testTemplate.templateId}`, {
      method: 'POST',
      headers: {
        'client_id': testUser.clientId,
        'client_secret': testUser.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateData: { name: 'Test User' }
      }),
    });

    // Act
    const response = await POST(request, { params: { templateId: testTemplate.templateId } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    
    const pdfBytes = await response.arrayBuffer();
    expect(pdfBytes.byteLength).toBeGreaterThan(0);
    
    // Verify PDF magic bytes
    const header = Buffer.from(pdfBytes.slice(0, 4)).toString('utf8');
    expect(header).toBe('%PDF');
    
    // Verify mock job-runner was called
    expect(mockJobRunner.getCallCount()).toBe(1);
    expect(mockJobRunner.getLastRequest()).toMatchObject({
      html: expect.stringContaining('Test User'),
    });
  });
});
```

### GitHub Actions Workflow

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  integration-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: templify_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run database migrations
        env:
          DATABASE_URL_TEST: postgresql://test:test@localhost:5432/templify_test
        run: npm run db:migrate:test
      
      - name: Run integration tests
        env:
          DATABASE_URL_TEST: postgresql://test:test@localhost:5432/templify_test
          JOB_RUNNER_BASE_URL: http://localhost:3001
          JOB_RUNNER_TOKEN: test-token
          ENCRYPTION_KEY: test-encryption-key-32-characters
        run: npm run test:integration
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: integration-test-results
          path: coverage/
```

### Package.json Scripts

```json
{
  "scripts": {
    "test:integration": "vitest run --config vitest.integration.config.mts",
    "test:integration:watch": "vitest --config vitest.integration.config.mts",
    "db:migrate:test": "DATABASE_URL=$DATABASE_URL_TEST drizzle-kit migrate"
  }
}
```

### Vitest Integration Config

```typescript
// vitest.integration.config.mts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    include: ['tests/integration/**/*.test.ts'],
    setupFiles: ['./tests/integration/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL_TEST,
      NODE_ENV: 'test',
    },
  },
});
```