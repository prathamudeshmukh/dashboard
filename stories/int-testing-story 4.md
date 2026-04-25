# Story 4: Rate Limiting & Credit Metering Integration Tests

## Business Context

Rate limiting and credit metering are critical business controls that protect the platform from abuse while ensuring fair usage across customers. These mechanisms directly impact revenue (credits determine billing) and system stability (rate limits prevent resource exhaustion).

Currently, these business-critical controls lack automated integration test coverage:
- **Rate limiting** uses Upstash Redis with a sliding window of 4 requests per 60 seconds per user
- **Credit metering** tracks user balances, deducts 1 credit per successful PDF generation, and enforces "charge only on success"
- Trial users receive 150 credits as a one-time allocation

Without comprehensive tests, changes to credit deduction logic, rate limiting configuration, or balance checking could:
- Incorrectly charge customers for failed requests
- Allow unlimited API calls bypassing rate limits
- Fail to enforce credit requirements, leading to revenue leakage
- Create race conditions in concurrent credit deduction

This story establishes integration test coverage for rate limiting and credit metering workflows, protecting business revenue and ensuring fair usage enforcement.

## Story Text

**As a** Product Owner  
**I want** automated integration tests for rate limiting and credit metering controls  
**So that** we protect revenue through correct credit enforcement and prevent system abuse through rate limiting without breaking these critical business rules

## Acceptance Criteria

### AC1: Rate Limit - Within Limits
**Given** a user has not exceeded their rate limit  
**And** the rate limit is 4 requests per 60 seconds  
**When** the user makes 4 consecutive convert API requests  
**Then** all 4 requests are successful (200 or 202 status codes)  
**And** the rate limit counter increments for each request  
**And** no requests are blocked

### AC2: Rate Limit - Exceeded
**Given** a user has made 4 requests in the current 60-second window  
**When** the user makes a 5th request within the same window  
**Then** the API returns a 429 (Too Many Requests) status code  
**And** the error message is: "Rate limit exceeded. Try again later."  
**And** no PDF generation is attempted  
**And** no credits are deducted  
**And** no database records are created

### AC3: Rate Limit - Window Reset
**Given** a user has hit the rate limit (4 requests in 60 seconds)  
**When** 60 seconds have elapsed  
**Then** the rate limit window resets  
**And** the user can make 4 new requests successfully  
**And** tests verify the sliding window behavior (not fixed window)

### AC4: Rate Limit - Per User Isolation
**Given** multiple users are making API requests  
**When** User A exceeds their rate limit  
**Then** only User A's requests are blocked (429 response)  
**And** User B can still make successful requests  
**And** rate limits are isolated by `client_id`

### AC5: Rate Limit - Applies to Both Sync and Async
**Given** a user is making both sync and async requests  
**When** the user makes 2 sync requests and 2 async requests within 60 seconds  
**Then** all 4 requests count toward the same rate limit  
**When** the user makes a 5th request (sync or async)  
**Then** the request is rate limited (429 response)  
**And** rate limiting is applied before async mode validation

### AC6: Credit Balance - Sufficient Credits
**Given** a user has 10 credits remaining  
**When** the user makes a successful convert API call  
**Then** the PDF is generated and returned  
**And** 1 credit is deducted from the user's balance  
**And** the user's balance is updated to 9 credits  
**And** the deduction occurs atomically with PDF generation success

### AC7: Credit Balance - Insufficient Credits
**Given** a user has 0 credits remaining  
**When** the user makes a convert API call  
**Then** the API returns a 402 (Payment Required) status code  
**And** the error message is: "Insufficient credits."  
**And** no PDF generation is attempted  
**And** no credits are deducted (balance remains 0)  
**And** no database record is created in generated_templates

### AC8: Credit Balance - Last Credit Used
**Given** a user has exactly 1 credit remaining  
**When** the user makes a successful convert API call  
**Then** the PDF is generated and returned  
**And** 1 credit is deducted  
**And** the user's balance is updated to 0 credits  
**When** the user immediately makes another request  
**Then** the request fails with 402 (Insufficient credits)

### AC9: Credit Deduction - Only on Success
**Given** a user has 10 credits  
**When** a convert API call fails (e.g., invalid template, job-runner error)  
**Then** no credits are deducted  
**And** the user's balance remains 10 credits  
**And** this applies to all failure scenarios (4xx and 5xx errors)

### AC10: Credit Deduction - Timing (Sync Mode)
**Given** a user makes a sync PDF generation request  
**When** the request is processed  
**Then** the credit check occurs BEFORE PDF generation  
**And** the credit deduction occurs AFTER PDF bytes are successfully generated  
**And** if job-runner fails, no credit is deducted  
**And** if credit deduction fails, the error is logged but PDF is still returned

### AC11: Credit Deduction - Timing (Async Mode)
**Given** a user makes an async PDF generation request  
**When** the 202 response is returned  
**Then** no credits are deducted at request time  
**And** credits are only deducted when the background job successfully generates the PDF  
**And** if the async job fails, no credits are deducted

### AC12: Credit Deduction - Concurrent Requests
**Given** a user has 5 credits remaining  
**When** the user makes 5 concurrent convert API requests  
**Then** all 5 requests should succeed (if within rate limit)  
**And** exactly 5 credits are deducted (no double-deduction)  
**And** the user's final balance is 0 credits  
**And** no race conditions occur in credit deduction

### AC13: Credit Deduction - Dev vs Prod Environment
**Given** a user makes requests to both dev and prod templates  
**When** dev template PDFs are generated  
**Then** credits are deducted from the same user balance  
**When** prod template PDFs are generated  
**Then** credits are deducted from the same user balance  
**And** both dev and prod consume the same credit pool  
**And** there is no environment-specific credit tracking

### AC14: Credit Transaction History
**Given** a user receives trial credits or top-ups  
**When** credits are added to the user's account  
**Then** a record is created in `credit_transactions` table with:
  - `clientId` (user identifier)
  - `credits` (amount credited)
  - `creditedAt` (timestamp)
  - `paymentId` (null for trial, set for paid top-ups)  
**And** the user's `remainingBalance` is incremented by the credited amount  
**And** the operation is transactional (both insert and update succeed or both fail)

### AC15: Trial Credit Allocation
**Given** a new user is created via Clerk webhook  
**When** the user creation process completes  
**Then** 150 trial credits are automatically allocated  
**And** a credit transaction record is created with `paymentId: null`  
**And** the user's `remainingBalance` is set to 150  
**And** tests verify the trial allocation happens atomically with user creation

### AC16: Rate Limit Does Not Prevent Credit Check
**Given** a user is rate limited (exceeded 4 requests in 60 seconds)  
**When** the rate limit period expires  
**And** the user makes a new request  
**Then** the credit check still occurs correctly  
**And** rate limiting and credit enforcement are independent validations  
**And** both can fail independently (rate limit OR insufficient credits)

### AC17: Credit Balance Returned in Error Response
**Given** a user has insufficient credits  
**When** the API returns a 402 error  
**Then** the error response includes the user's current balance (for debugging)  
**And** the response format is consistent with other error responses  
**And** no sensitive information is exposed beyond balance

### AC18: Rate Limit Analytics Enabled
**Given** Upstash rate limiting is configured with analytics  
**When** requests are rate limited  
**Then** rate limit events are tracked for analytics (via Upstash)  
**And** tests verify the `analytics: true` configuration is active  
**And** rate limit metrics can be queried (if accessible in test environment)

### NFR1: Test Isolation
**Given** multiple rate limit and credit tests run  
**When** tests execute in parallel or sequentially  
**Then** each test uses isolated user accounts with separate balances  
**And** rate limit state is isolated per test (different `client_id`)  
**And** mock Redis is used to avoid shared state between tests  
**And** tests clean up rate limit state and user balances after execution

### NFR2: Test Maintainability
**Given** rate limit and credit tests involve timing and state  
**When** tests are written  
**Then** shared helpers exist for:
  - Creating users with specific credit balances
  - Making rapid sequential requests for rate limit testing
  - Waiting for rate limit window expiration
  - Verifying credit balance changes
  - Simulating concurrent requests  
**And** time-dependent tests use controllable mocks (not real delays)  
**And** credit transaction helpers are reusable

### NFR3: CI/CD Integration
**Given** rate limit and credit tests are implemented  
**Then** tests run in GitHub Actions pipeline  
**And** mock Upstash Redis is used in CI (or test Redis instance)  
**And** tests complete within 120 seconds total (including rate limit window tests)  
**And** time-sensitive tests are robust (not flaky)

## Out of Scope

- Manual credit top-ups via admin UI (E2E/manual testing scope)
- Stripe payment integration for credit purchases (separate story)
- Credit usage analytics and reporting dashboard (separate story)
- Rate limit configuration changes (e.g., different limits per plan - future feature)
- Rate limit bypass for premium users (future feature)
- Credit refunds or reversals (future feature)
- Multi-organization credit pooling (future feature)
- Credit expiration policies (not currently implemented)
- Detailed rate limit observability beyond basic analytics flag

## Dependencies

**Story 0: Setup Integration Test Infrastructure** (MUST be completed first)
- Mock Upstash Redis for rate limiting
- Test database for credit balance tracking
- Test user fixtures with configurable balances

**Story 1: Core Convert API Integration Tests** (RECOMMENDED to be completed first)
- Establishes convert API testing patterns
- Provides shared test helpers

## Assumptions

- Rate limit is 4 requests per 60 seconds per `client_id` (current configuration)
- Rate limit uses Upstash Redis sliding window algorithm
- Credits are tracked per user (`clientId`), not per organization (current scope)
- Trial credits are 150 per user (one-time allocation)
- 1 credit = 1 PDF generation (sync or async)
- Credit deduction logic is in `generatePdf` function when `isApi=true`
- Credit check occurs before PDF generation, deduction after success
- Failed requests do not consume credits (any HTTP 4xx or 5xx)
- Rate limiting occurs before credit check in request flow
- Mock Upstash Redis allows control over rate limit state in tests
- Concurrent credit deduction uses database-level constraints to prevent double-deduction
- Dev and prod environments share the same credit pool per user
- Credit transactions are stored for audit/history purposes
- Tests can manipulate time or use mock timers for rate limit window testing
- Credit balance verification requires querying the database directly

## Supporting Documentation

### Recommended Test Structure
```
tests/
└── integration/
    └── convert-api/
        ├── rate-limiting.test.ts           # AC1-AC5
        ├── credit-enforcement.test.ts      # AC6-AC9
        ├── credit-deduction-timing.test.ts # AC10-AC11
        ├── credit-concurrency.test.ts      # AC12-AC13
        ├── credit-transactions.test.ts     # AC14-AC15
        ├── rate-limit-credit-interaction.test.ts # AC16-AC18
        └── fixtures/
            ├── test-credits.ts
            ├── mock-rate-limiter.ts
            └── concurrent-requests.ts
```

### Example Test: Rate Limiting

```typescript
// tests/integration/convert-api/rate-limiting.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestUser, createTestTemplate, cleanupTestData } from '../fixtures/test-users';
import { mockRateLimiter, resetRateLimiter } from '../mocks/mock-rate-limiter';
import { POST } from '@/app/[locale]/convert/[templateId]/route';

describe('Rate Limiting', () => {
  let testUser: any;
  let testTemplate: any;

  beforeEach(async () => {
    testUser = await createTestUser({ credits: 100 }); // Plenty of credits
    testTemplate = await createTestTemplate(testUser.email);
    resetRateLimiter();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it('AC1: should allow 4 requests within rate limit window', async () => {
    // Arrange
    const makeRequest = async () => {
      return POST(
        new Request(`http://localhost/convert/${testTemplate.templateId}`, {
          method: 'POST',
          headers: {
            'client_id': testUser.clientId,
            'client_secret': testUser.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ templateData: { name: 'Test' } }),
        }),
        { params: { templateId: testTemplate.templateId } }
      );
    };

    // Act - Make 4 requests
    const responses = [];
    for (let i = 0; i < 4; i++) {
      responses.push(await makeRequest());
    }

    // Assert - All succeed
    for (const response of responses) {
      expect(response.status).toBe(200);
    }

    // Verify rate limit counter
    const rateLimitState = mockRateLimiter.getState(`user:${testUser.clientId}`);
    expect(rateLimitState.count).toBe(4);
  });

  it('AC2: should block 5th request with 429 status', async () => {
    // Arrange - Make 4 requests to hit limit
    const makeRequest = async () => {
      return POST(
        new Request(`http://localhost/convert/${testTemplate.templateId}`, {
          method: 'POST',
          headers: {
            'client_id': testUser.clientId,
            'client_secret': testUser.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ templateData: { name: 'Test' } }),
        }),
        { params: { templateId: testTemplate.templateId } }
      );
    };

    for (let i = 0; i < 4; i++) {
      await makeRequest();
    }

    // Act - 5th request
    const response = await makeRequest();

    // Assert
    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error).toBe('Rate limit exceeded. Try again later.');

    // Verify no credit deduction
    const updatedUser = await getUserById(testUser.clientId);
    expect(updatedUser.remainingBalance).toBe(96); // 4 credits deducted from first 4 requests
  });

  it('AC4: should isolate rate limits per user', async () => {
    // Arrange - Create second user
    const testUser2 = await createTestUser({ credits: 100 });

    // Act - User 1 hits rate limit
    for (let i = 0; i < 4; i++) {
      await POST(
        new Request(`http://localhost/convert/${testTemplate.templateId}`, {
          method: 'POST',
          headers: {
            'client_id': testUser.clientId,
            'client_secret': testUser.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ templateData: { name: 'Test' } }),
        }),
        { params: { templateId: testTemplate.templateId } }
      );
    }

    // User 1's 5th request fails
    const user1Response = await POST(
      new Request(`http://localhost/convert/${testTemplate.templateId}`, {
        method: 'POST',
        headers: {
          'client_id': testUser.clientId,
          'client_secret': testUser.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateData: { name: 'Test' } }),
      }),
      { params: { templateId: testTemplate.templateId } }
    );

    // User 2's request succeeds
    const user2Response = await POST(
      new Request(`http://localhost/convert/${testTemplate.templateId}`, {
        method: 'POST',
        headers: {
          'client_id': testUser2.clientId,
          'client_secret': testUser2.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateData: { name: 'Test' } }),
      }),
      { params: { templateId: testTemplate.templateId } }
    );

    // Assert
    expect(user1Response.status).toBe(429);
    expect(user2Response.status).toBe(200);
  });
});
```

### Example Test: Credit Enforcement

```typescript
// tests/integration/convert-api/credit-enforcement.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestUser, createTestTemplate, cleanupTestData } from '../fixtures/test-users';
import { setUserCredits, getUserById } from '../fixtures/test-credits';
import { POST } from '@/app/[locale]/convert/[templateId]/route';

describe('Credit Enforcement', () => {
  let testUser: any;
  let testTemplate: any;

  beforeEach(async () => {
    testUser = await createTestUser({ credits: 10 });
    testTemplate = await createTestTemplate(testUser.email);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it('AC6: should deduct 1 credit on successful PDF generation', async () => {
    // Arrange
    const initialBalance = 10;
    const request = new Request(`http://localhost/convert/${testTemplate.templateId}`, {
      method: 'POST',
      headers: {
        'client_id': testUser.clientId,
        'client_secret': testUser.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ templateData: { name: 'Test' } }),
    });

    // Act
    const response = await POST(request, { params: { templateId: testTemplate.templateId } });

    // Assert
    expect(response.status).toBe(200);
    
    const updatedUser = await getUserById(testUser.clientId);
    expect(updatedUser.remainingBalance).toBe(initialBalance - 1);
  });

  it('AC7: should reject request with 402 when credits are insufficient', async () => {
    // Arrange - Set balance to 0
    await setUserCredits(testUser.clientId, 0);

    const request = new Request(`http://localhost/convert/${testTemplate.templateId}`, {
      method: 'POST',
      headers: {
        'client_id': testUser.clientId,
        'client_secret': testUser.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ templateData: { name: 'Test' } }),
    });

    // Act
    const response = await POST(request, { params: { templateId: testTemplate.templateId } });

    // Assert
    expect(response.status).toBe(402);
    const body = await response.json();
    expect(body.error).toBe('Insufficient credits.');

    // Verify balance unchanged
    const user = await getUserById(testUser.clientId);
    expect(user.remainingBalance).toBe(0);
  });

  it('AC9: should not deduct credits on failure', async () => {
    // Arrange - Create request with invalid template ID
    const initialBalance = 10;
    const request = new Request(`http://localhost/convert/invalid-template-id`, {
      method: 'POST',
      headers: {
        'client_id': testUser.clientId,
        'client_secret': testUser.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ templateData: { name: 'Test' } }),
    });

    // Act
    const response = await POST(request, { params: { templateId: 'invalid-template-id' } });

    // Assert
    expect(response.status).toBe(404);

    const user = await getUserById(testUser.clientId);
    expect(user.remainingBalance).toBe(initialBalance); // No deduction
  });
});
```

### Mock Rate Limiter Helper

```typescript
// mocks/mock-rate-limiter.ts
import { vi } from 'vitest';

class MockRateLimiter {
  private state: Map<string, { count: number; resetAt: number }> = new Map();
  private limit = 4;
  private windowMs = 60000;

  async limit(key: string) {
    const now = Date.now();
    const userState = this.state.get(key);

    if (!userState || now >= userState.resetAt) {
      // New window
      this.state.set(key, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return { success: true };
    }

    if (userState.count >= this.limit) {
      // Rate limited
      return { success: false };
    }

    // Increment counter
    userState.count++;
    return { success: true };
  }

  getState(key: string) {
    return this.state.get(key) || { count: 0, resetAt: 0 };
  }

  reset() {
    this.state.clear();
  }
}

export const mockRateLimiter = new MockRateLimiter();
export const resetRateLimiter = () => mockRateLimiter.reset();

// Mock the Ratelimit module
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    limit = mockRateLimiter.limit.bind(mockRateLimiter);
    static slidingWindow = () => ({});
  },
}));
```