# Story 1: Core Convert API Integration Tests (Sync + Auth)

## Business Context

Templify's convert API is the primary revenue-generating endpoint that customers depend on for PDF generation in their production workflows. As the product evolves and new features are added, there is a risk of introducing regressions that break existing customer integrations. Currently, the convert API lacks comprehensive integration test coverage, making it difficult to confidently release changes without extensive manual testing.

This story addresses the need for automated regression prevention by establishing integration test coverage for the core synchronous PDF generation flows and authentication mechanisms. These represent the most critical customer-facing workflows that must remain stable.

With these tests in place, the team will be able to release features faster with confidence that existing customer integrations are protected from unintended breaking changes.

## Story Text

**As a** Product Owner  
**I want** automated integration tests for the core convert API synchronous flows and authentication  
**So that** we can release features faster while protecting existing customer workflows from regressions

## Acceptance Criteria

### AC1: Synchronous PDF Generation - Dev Environment
**Given** a valid template exists in the dev environment  
**And** the test provides valid template data  
**When** the convert API is called with the dev template ID  
**Then** the API returns a 200 status code  
**And** the response Content-Type is "application/pdf"  
**And** the response body contains valid PDF bytes (verified by PDF magic bytes)  
**And** a record is created in the generated_templates table with mode "SYNC"  
**And** the job-runner service is called with the correctly rendered HTML

### AC2: Synchronous PDF Generation - Prod Environment
**Given** a valid template exists in the prod environment  
**And** the test provides valid template data and devMode=false  
**When** the convert API is called  
**Then** the API returns a 200 status code  
**And** the response contains valid PDF bytes  
**And** the prod template is used (not dev)  
**And** a record is created in generated_templates referencing the prod template

### AC3: Sample Data Fallback
**Given** a valid template exists with sample data defined  
**And** the test does NOT provide templateData in the request  
**When** the convert API is called  
**Then** the API returns a 200 status code  
**And** the template is rendered using the stored sample data  
**And** a valid PDF is generated

### AC4: Authentication Success
**Given** valid API credentials (client_id and client_secret) exist in the database  
**When** the convert API is called with correct credentials in headers  
**Then** the request is authenticated successfully  
**And** PDF generation proceeds normally

### AC5: Authentication Failure - Invalid Credentials
**Given** API credentials are configured  
**When** the convert API is called with invalid or mismatched credentials  
**Then** the API returns a 401 status code  
**And** an error response with message indicating authentication failure  
**And** no PDF generation is attempted  
**And** no database records are created

### AC6: Authentication Failure - Missing Credentials
**Given** API credentials are required  
**When** the convert API is called without client_id or client_secret headers  
**Then** the API returns a 401 status code  
**And** an error response indicating missing authentication headers  
**And** no PDF generation is attempted

### AC7: Invalid Template ID
**Given** a template ID that does not exist in the database  
**When** the convert API is called with this invalid template ID  
**Then** the API returns an appropriate error status code (404 or 400)  
**And** an error response indicating the template was not found  
**And** no PDF generation is attempted

### AC8: Template Data Variation - Large Payload
**Given** a valid template exists  
**And** the test provides a large template data payload (e.g., 1MB JSON)  
**When** the convert API is called  
**Then** the API successfully processes the large payload  
**And** returns a valid PDF

### AC9: Template Data Variation - Special Characters
**Given** a valid template exists  
**And** the template data contains special characters (HTML entities, unicode, quotes, etc.)  
**When** the convert API is called  
**Then** the API correctly escapes/handles special characters  
**And** returns a valid PDF without encoding issues

### AC10: Template Data Variation - Nested Objects
**Given** a valid template with placeholders for nested data  
**And** the template data contains deeply nested objects  
**When** the convert API is called  
**Then** the template correctly renders nested properties  
**And** returns a valid PDF

### AC11: Template Data Variation - Empty Data
**Given** a valid template with sample data defined  
**And** the template data is provided as an empty object {}  
**When** the convert API is called  
**Then** the API processes the request  
**And** returns a valid PDF (using empty data, not falling back to sample data)

### AC12: Template Data Variation - Null vs Missing
**Given** a valid template exists  
**When** template data fields are null vs undefined vs missing  
**Then** the template engine handles each case appropriately  
**And** returns a valid PDF

### NFR1: Test Isolation
**Given** multiple tests in the test suite  
**When** tests are run in any order or in parallel  
**Then** each test is independent and does not affect others  
**And** each test creates and cleans up its own test data (templates, users, API keys)  
**And** tests can be run multiple times without conflicts

### NFR2: Test Maintainability
**Given** integration tests are implemented  
**Then** shared fixtures and helper functions are used to avoid code duplication  
**And** test data setup is reusable across test cases  
**And** mock configurations are centralized and easy to update

### NFR3: CI/CD Integration
**Given** integration tests are implemented  
**Then** tests run automatically on pull requests  
**And** tests must pass before code can be merged  
**And** test results are clearly reported in CI/CD pipeline

### NFR4: Code Coverage
**Given** integration tests are implemented  
**Then** the convert API route handler achieves at least 80% code coverage  
**And** all major code paths (happy path, auth failures, validation errors) are exercised

### NFR5: Test Data Management
**Given** integration tests require database state  
**Then** each test seeds its own test data using database transactions or cleanup hooks  
**And** test data does not pollute the test database between runs  
**And** sensitive data (API secrets, tokens) is properly encrypted in test fixtures

### NFR6: Test Documentation
**Given** integration tests are implemented  
**Then** each test has a clear, descriptive name that explains what it validates  
**And** complex test scenarios include comments explaining the setup and assertions  
**And** a README documents how to run integration tests locally

## Out of Scope

- Asynchronous PDF generation workflows (covered in Story 3)
- Webhook delivery and events (covered in Story 3)
- Rate limiting behavior (covered in Story 4)
- Credit enforcement and metering (covered in Story 4)
- Error scenarios beyond template-not-found (covered in Story 2):
  - Malformed request payloads
  - Job-runner service failures
  - Database connection errors
  - Timeout scenarios
- Performance/load testing
- End-to-end tests using real job-runner service
- Testing template promotion (dev to prod)
- Testing preview generation

## Dependencies

**Story 0: Setup Integration Test Infrastructure** (MUST be completed first)
- Test database provisioned and accessible
- Test environment variables configured
- Integration test framework and patterns established (Vitest)
- Mock server setup for job-runner service
- CI/CD pipeline configured to run integration tests
- Base test fixtures and helpers created

## Assumptions

- Vitest is used as the testing framework (per project guidelines)
- Tests use a hybrid approach: real database/routes/auth, mocked external services (job-runner, Inngest, Vercel Blob)
- A dedicated test database is available (separate from dev/staging/prod)
- The convert API route structure and behavior is stable and not undergoing major refactoring
- Mock job-runner service can return valid mock PDF bytes for testing
- Inngest event triggering can be mocked/stubbed for verification without actual event delivery
- Test users and API credentials can be created and destroyed as part of test setup/teardown
- The team has access to run integration tests locally and in CI/CD

## Supporting Documentation

### Recommended Test Structure
```
dashboard/
└── tests/
    └── integration/
        └── convert-api/
            ├── sync-generation.test.ts       # AC1, AC2, AC3
            ├── authentication.test.ts        # AC4, AC5, AC6
            ├── validation.test.ts            # AC7
            ├── template-data-variations.test.ts  # AC8-AC12
            └── fixtures/
                ├── test-users.ts
                ├── test-templates.ts
                ├── mock-job-runner.ts
                └── test-helpers.ts
```

### Sequence Diagram: Synchronous PDF Generation Test Flow
```
Test → Convert API: POST /convert/{templateId}
                    (client_id, client_secret, templateData)
Convert API → DB: Lookup credentials & template
DB → Convert API: Return user & template
Convert API → Mock Job-Runner: POST /generate-pdf {html}
Mock Job-Runner → Convert API: Return mock PDF bytes
Convert API → DB: Insert generated_templates record
Convert API → Test: 200 + PDF bytes
Test → DB: Verify generated_templates record
Test: Assert PDF magic bytes, headers, status
```

### Mock Job-Runner Configuration
- Mock endpoint should accept HTML payload
- Return valid PDF magic bytes (%PDF-1.4...)
- Verify request includes Authorization header
- Allow test to verify HTML rendering was correct
