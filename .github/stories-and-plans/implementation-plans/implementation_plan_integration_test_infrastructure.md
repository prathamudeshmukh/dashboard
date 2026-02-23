# Integration Test Infrastructure Implementation Plan

## Overview
Establish comprehensive integration testing infrastructure for the Templify dashboard, enabling isolated testing of API routes, database interactions, and external service integrations. This foundation unlocks Stories 1-4 (convert API regression tests) and enables confident, fast feature releases.

## Architecture
The infrastructure follows a layered approach:
- **Test Database Layer**: Isolated PostgreSQL test database with automatic migrations and cleanup
- **Mock Service Layer**: HTTP mocks for job-runner, Inngest event stubs, and Blob storage mocks
- **Fixture Layer**: Reusable test data factories for users, templates, and API credentials
- **Test Runner Layer**: Vitest configuration optimized for integration tests with proper timeouts and isolation

**Integration Flow**: Test → Fixture Creation → API Call → Mock Services → Database Assertions → Cleanup

## Implementation Phases

### Phase 1: Test Database Setup & Configuration
**Files**: 
- `src/libs/test-db.ts` (new)
- `drizzle.config.test.ts` (new)
- `.env.test.example` (new)
- `vitest.integration.config.mts` (new)
- `package.json`

**Test Files**: 
- `tests/integration/setup.test.ts` (new)

Set up isolated test database infrastructure with automatic migrations and cleanup mechanisms.

**Key code changes:**

```typescript
// src/libs/test-db.ts
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import * as schema from '../models/Schema';

let testPool: Pool | null = null;
let testDb: ReturnType<typeof drizzle> | null = null;

export async function getTestDb() {
  if (!process.env.DATABASE_URL_TEST) {
    throw new Error('DATABASE_URL_TEST environment variable is not set');
  }

  if (!testDb) {
    testPool = new Pool({ 
      connectionString: process.env.DATABASE_URL_TEST,
      ssl: { rejectUnauthorized: false }
    });
    testDb = drizzle(testPool, { schema });
  }

  return testDb;
}

export async function cleanupTestDb() {
  if (!testDb) return;

  const db = await getTestDb();
  
  // Truncate all tables in reverse dependency order
  await db.execute(sql`TRUNCATE TABLE generated_templates, webhook_deliveries, webhook_events, credit_transactions, apikeys, templates, template_gallery, webhook_endpoints, users CASCADE`);
}

export async function closeTestDb() {
  if (testPool) {
    await testPool.end();
    testPool = null;
    testDb = null;
  }
}
```

```typescript
// drizzle.config.test.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './migrations',
  schema: './src/models/Schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_TEST ?? '',
  },
  verbose: true,
  strict: true,
});
```

```typescript
// vitest.integration.config.mts
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

// Load .env.test if it exists
config({ path: '.env.test' });

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    include: ['tests/integration/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    setupFiles: ['./tests/integration/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: 'forks', // Run tests in separate processes for isolation
    poolOptions: {
      forks: {
        singleFork: true, // Sequential execution to avoid DB contention
      },
    },
    env: {
      NODE_ENV: 'test',
      DATABASE_URL_TEST: process.env.DATABASE_URL_TEST,
      JOB_RUNNER_BASE_URL: process.env.JOB_RUNNER_BASE_URL || 'http://localhost:3001',
      JOB_RUNNER_TOKEN: process.env.JOB_RUNNER_TOKEN || 'test-token',
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'test-encryption-key-32chars!!',
    },
  },
});
```

```bash
# .env.test.example
# Copy this file to .env.test and fill in actual values

# Test Database
DATABASE_URL_TEST=postgresql://test:test@localhost:5433/templify_test

# Mock Services
JOB_RUNNER_BASE_URL=http://localhost:3001
JOB_RUNNER_TOKEN=test-token-12345

# Encryption
ENCRYPTION_KEY=test-encryption-key-must-be-32-characters-long

# Upstash (mock in tests)
KV_REST_API_URL=http://localhost:8079
KV_REST_API_TOKEN=test-token

# Clerk (optional for integration tests)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

**Test cases for this phase:**
```typescript
// tests/integration/setup.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTestDb, cleanupTestDb, closeTestDb } from '@/libs/test-db';
import { users } from '@/models/Schema';

describe('Test Database Setup', () => {
  beforeAll(async () => {
    await cleanupTestDb();
  });

  afterAll(async () => {
    await cleanupTestDb();
    await closeTestDb();
  });

  it('should connect to test database successfully', async () => {
    const db = await getTestDb();
    expect(db).toBeDefined();
  });

  it('should be able to query database tables', async () => {
    const db = await getTestDb();
    const result = await db.select().from(users).limit(1);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should use separate test database (not production)', async () => {
    expect(process.env.DATABASE_URL_TEST).toBeDefined();
    expect(process.env.DATABASE_URL_TEST).not.toEqual(process.env.DATABASE_URL);
    expect(process.env.DATABASE_URL_TEST).toContain('test');
  });

  it('should cleanup database successfully', async () => {
    const db = await getTestDb();
    
    // Insert test data
    await db.insert(users).values({
      clientId: 'test-cleanup',
      email: 'cleanup@test.com',
      remainingBalance: 100,
    });

    // Cleanup
    await cleanupTestDb();

    // Verify cleanup
    const result = await db.select().from(users).limit(10);
    expect(result.length).toBe(0);
  });
});
```

**Technical details and Assumptions:**
- Test database runs on port 5433 to avoid conflicts with local development database (port 5432)
- Sequential test execution prevents database lock contention (can be optimized later with better isolation)
- Truncate cascade ensures all dependent records are cleaned
- Environment variables are validated on test startup

---

### Phase 2: Mock Services Layer
**Files**: 
- `tests/integration/mocks/mock-job-runner.ts` (new)
- `tests/integration/mocks/mock-inngest.ts` (new)
- `tests/integration/mocks/mock-blob.ts` (new)
- `tests/integration/mocks/mock-upstash.ts` (new)

**Test Files**: 
- `tests/integration/mocks/mock-job-runner.test.ts` (new)
- `tests/integration/mocks/mock-inngest.test.ts` (new)

Create mock HTTP servers and service stubs that simulate external dependencies.

**Key code changes:**

```typescript
// tests/integration/mocks/mock-job-runner.ts
import express, { Request, Response } from 'express';
import type { Server } from 'http';

type RequestLog = {
  timestamp: Date;
  method: string;
  path: string;
  headers: any;
  body: any;
};

export class MockJobRunner {
  private app: express.Application;
  private server: Server | null = null;
  private requestLogs: RequestLog[] = [];
  private mockResponses: Map<string, { status: number; data: any }> = new Map();

  constructor() {
    this.app = express();
    this.app.use(express.json({ limit: '50mb' }));

    // POST /generate-pdf endpoint
    this.app.post('/generate-pdf', (req: Request, res: Response) => {
      // Log request
      this.requestLogs.push({
        timestamp: new Date(),
        method: 'POST',
        path: '/generate-pdf',
        headers: req.headers,
        body: req.body,
      });

      // Check authorization
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check for custom mock response
      const mockResponse = this.mockResponses.get('generate-pdf');
      if (mockResponse) {
        return res.status(mockResponse.status).send(mockResponse.data);
      }

      // Default: Return mock PDF bytes
      const mockPdfBuffer = Buffer.from('%PDF-1.4\n%Mock PDF content\n%%EOF');
      res.setHeader('Content-Type', 'application/pdf');
      res.send(mockPdfBuffer);
    });
  }

  async start(port: number = 3001): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(port, () => {
        console.log(`Mock Job Runner started on port ${port}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server!.close(() => {
          console.log('Mock Job Runner stopped');
          resolve();
        });
      });
    }
  }

  getRequestLogs(): RequestLog[] {
    return this.requestLogs;
  }

  getLastRequest(): RequestLog | undefined {
    return this.requestLogs[this.requestLogs.length - 1];
  }

  getCallCount(): number {
    return this.requestLogs.length;
  }

  clearLogs(): void {
    this.requestLogs = [];
  }

  setMockResponse(endpoint: string, status: number, data: any): void {
    this.mockResponses.set(endpoint, { status, data });
  }

  clearMockResponses(): void {
    this.mockResponses.clear();
  }

  // Helper to verify request was made with specific data
  wasCalledWith(matcher: Partial<RequestLog>): boolean {
    return this.requestLogs.some(log => {
      if (matcher.method && log.method !== matcher.method) return false;
      if (matcher.path && log.path !== matcher.path) return false;
      if (matcher.body && JSON.stringify(log.body) !== JSON.stringify(matcher.body)) return false;
      return true;
    });
  }
}

// Singleton instance for tests
let mockJobRunnerInstance: MockJobRunner | null = null;

export async function startMockJobRunner(port: number = 3001): Promise<MockJobRunner> {
  if (mockJobRunnerInstance) {
    return mockJobRunnerInstance;
  }

  mockJobRunnerInstance = new MockJobRunner();
  await mockJobRunnerInstance.start(port);
  return mockJobRunnerInstance;
}

export async function stopMockJobRunner(): Promise<void> {
  if (mockJobRunnerInstance) {
    await mockJobRunnerInstance.stop();
    mockJobRunnerInstance = null;
  }
}

export function getMockJobRunner(): MockJobRunner | null {
  return mockJobRunnerInstance;
}
```

```typescript
// tests/integration/mocks/mock-inngest.ts
import { vi } from 'vitest';

type InngestEvent = {
  name: string;
  data: any;
  ts?: number;
};

export class MockInngestClient {
  private sentEvents: InngestEvent[] = [];

  async send(event: InngestEvent | InngestEvent[]): Promise<{ ids: string[] }> {
    const events = Array.isArray(event) ? event : [event];
    
    events.forEach(evt => {
      this.sentEvents.push({
        ...evt,
        ts: evt.ts || Date.now(),
      });
    });

    return { ids: events.map(() => `mock-event-${Date.now()}`) };
  }

  getEvents(): InngestEvent[] {
    return this.sentEvents;
  }

  getEventsByName(name: string): InngestEvent[] {
    return this.sentEvents.filter(evt => evt.name === name);
  }

  getLastEvent(): InngestEvent | undefined {
    return this.sentEvents[this.sentEvents.length - 1];
  }

  wasEventSent(name: string, matcher?: (data: any) => boolean): boolean {
    const events = this.getEventsByName(name);
    if (!matcher) return events.length > 0;
    return events.some(evt => matcher(evt.data));
  }

  clear(): void {
    this.sentEvents = [];
  }
}

// Global mock instance
export const mockInngest = new MockInngestClient();

// Mock the inngest client module
export function setupInngestMock() {
  vi.mock('@/inngest/client', () => ({
    inngest: mockInngest,
  }));
}

export function resetInngestMock() {
  mockInngest.clear();
}
```

```typescript
// tests/integration/mocks/mock-blob.ts
import { vi } from 'vitest';

type BlobUpload = {
  pathname: string;
  content: Buffer | string;
  timestamp: Date;
};

export class MockBlobStorage {
  private uploads: Map<string, BlobUpload> = new Map();

  async put(pathname: string, content: Buffer | string): Promise<{ url: string }> {
    this.uploads.set(pathname, {
      pathname,
      content,
      timestamp: new Date(),
    });

    return {
      url: `https://mock-blob.vercel-storage.com/${pathname}`,
    };
  }

  async del(urls: string | string[]): Promise<void> {
    const urlArray = Array.isArray(urls) ? urls : [urls];
    
    urlArray.forEach(url => {
      const pathname = url.replace('https://mock-blob.vercel-storage.com/', '');
      this.uploads.delete(pathname);
    });
  }

  getUpload(pathname: string): BlobUpload | undefined {
    return this.uploads.get(pathname);
  }

  getAllUploads(): BlobUpload[] {
    return Array.from(this.uploads.values());
  }

  wasUploaded(pathname: string): boolean {
    return this.uploads.has(pathname);
  }

  clear(): void {
    this.uploads.clear();
  }
}

export const mockBlob = new MockBlobStorage();

export function setupBlobMock() {
  vi.mock('@vercel/blob', () => ({
    put: vi.fn(async (pathname: string, content: Buffer | string) => {
      return mockBlob.put(pathname, content);
    }),
    del: vi.fn(async (urls: string | string[]) => {
      return mockBlob.del(urls);
    }),
  }));
}

export function resetBlobMock() {
  mockBlob.clear();
}
```

```typescript
// tests/integration/mocks/mock-upstash.ts
import { vi } from 'vitest';

export class MockRatelimit {
  private limits: Map<string, { count: number; resetAt: number }> = new Map();

  async limit(identifier: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now();
    const current = this.limits.get(identifier);

    if (!current || current.resetAt < now) {
      // Reset window
      this.limits.set(identifier, {
        count: 1,
        resetAt: now + 60000, // 60 seconds
      });

      return {
        success: true,
        limit: 4,
        remaining: 3,
        reset: now + 60000,
      };
    }

    // Increment count
    current.count += 1;
    const remaining = Math.max(0, 4 - current.count);
    const success = current.count <= 4;

    return {
      success,
      limit: 4,
      remaining,
      reset: current.resetAt,
    };
  }

  clear(): void {
    this.limits.clear();
  }

  // Test helper to force rate limit
  forceRateLimit(identifier: string): void {
    this.limits.set(identifier, {
      count: 10, // Exceed limit
      resetAt: Date.now() + 60000,
    });
  }
}

export const mockRatelimit = new MockRatelimit();

export function setupUpstashMock() {
  vi.mock('@upstash/ratelimit', () => ({
    Ratelimit: vi.fn().mockImplementation(() => mockRatelimit),
  }));
}

export function resetUpstashMock() {
  mockRatelimit.clear();
}
```

**Test cases for this phase:**
```typescript
// tests/integration/mocks/mock-job-runner.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import { startMockJobRunner, stopMockJobRunner, getMockJobRunner } from './mock-job-runner';

describe('Mock Job Runner', () => {
  beforeAll(async () => {
    await startMockJobRunner(3001);
  });

  afterAll(async () => {
    await stopMockJobRunner();
  });

  it('should start and respond to requests', async () => {
    const response = await axios.post('http://localhost:3001/generate-pdf', {
      html: '<html>test</html>',
    }, {
      headers: {
        'Authorization': 'Bearer test-token',
      },
      responseType: 'arraybuffer',
    });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/pdf');
    
    const pdfHeader = Buffer.from(response.data.slice(0, 4)).toString('utf8');
    expect(pdfHeader).toBe('%PDF');
  });

  it('should reject requests without authorization', async () => {
    try {
      await axios.post('http://localhost:3001/generate-pdf', {
        html: '<html>test</html>',
      });
      expect.fail('Should have thrown 401');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });

  it('should log all requests', async () => {
    const mock = getMockJobRunner();
    mock?.clearLogs();

    await axios.post('http://localhost:3001/generate-pdf', {
      html: '<html>logged</html>',
    }, {
      headers: { 'Authorization': 'Bearer test-token' },
    });

    expect(mock?.getCallCount()).toBe(1);
    expect(mock?.getLastRequest()?.body.html).toBe('<html>logged</html>');
  });

  it('should support custom mock responses', async () => {
    const mock = getMockJobRunner();
    mock?.setMockResponse('generate-pdf', 500, { error: 'Mock error' });

    try {
      await axios.post('http://localhost:3001/generate-pdf', {
        html: '<html>test</html>',
      }, {
        headers: { 'Authorization': 'Bearer test-token' },
      });
      expect.fail('Should have thrown 500');
    } catch (error: any) {
      expect(error.response.status).toBe(500);
      expect(error.response.data.error).toBe('Mock error');
    }

    mock?.clearMockResponses();
  });
});
```

```typescript
// tests/integration/mocks/mock-inngest.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { mockInngest, resetInngestMock } from './mock-inngest';

describe('Mock Inngest Client', () => {
  beforeEach(() => {
    resetInngestMock();
  });

  it('should capture sent events', async () => {
    await mockInngest.send({
      name: 'test/event',
      data: { value: 123 },
    });

    const events = mockInngest.getEvents();
    expect(events.length).toBe(1);
    expect(events[0].name).toBe('test/event');
    expect(events[0].data.value).toBe(123);
  });

  it('should support batch event sending', async () => {
    await mockInngest.send([
      { name: 'event-1', data: { id: 1 } },
      { name: 'event-2', data: { id: 2 } },
    ]);

    expect(mockInngest.getEvents().length).toBe(2);
  });

  it('should filter events by name', async () => {
    await mockInngest.send({ name: 'pdf/generate', data: {} });
    await mockInngest.send({ name: 'webhook/send', data: {} });
    await mockInngest.send({ name: 'pdf/generate', data: {} });

    const pdfEvents = mockInngest.getEventsByName('pdf/generate');
    expect(pdfEvents.length).toBe(2);
  });

  it('should verify events with matcher function', async () => {
    await mockInngest.send({
      name: 'pdf/generate',
      data: { templateId: 'test-123' },
    });

    const wasSent = mockInngest.wasEventSent('pdf/generate', (data) => {
      return data.templateId === 'test-123';
    });

    expect(wasSent).toBe(true);
  });
});
```

**Technical details and Assumptions:**
- Mock job-runner runs on port 3001 to avoid conflicts
- Mocks provide verification APIs for test assertions
- Inngest events are captured but not executed (no actual background jobs)
- Blob storage is fully in-memory during tests

---

### Phase 3: Test Fixtures and Helpers
**Files**: 
- `tests/integration/fixtures/test-users.ts` (new)
- `tests/integration/fixtures/test-templates.ts` (new)
- `tests/integration/helpers/test-helpers.ts` (new)
- `tests/integration/helpers/auth-helpers.ts` (new)

**Test Files**: 
- `tests/integration/fixtures/test-users.test.ts` (new)

Create reusable fixture factories and helper utilities for common test operations.

**Key code changes:**

```typescript
// tests/integration/fixtures/test-users.ts
import { getTestDb } from '@/libs/test-db';
import { users, apikeys } from '@/models/Schema';
import { encrypt } from '@/service/crypto';
import { randomBytes } from 'crypto';

export type TestUser = {
  clientId: string;
  email: string;
  remainingBalance: number;
  apiKey: string;
  apiKeyId: string;
};

export async function createTestUser(overrides?: {
  email?: string;
  remainingBalance?: number;
}): Promise<TestUser> {
  const db = await getTestDb();
  
  const clientId = `test-user-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const email = overrides?.email || `${clientId}@test.com`;
  const remainingBalance = overrides?.remainingBalance ?? 150;

  // Create user
  const [user] = await db.insert(users).values({
    clientId,
    email,
    remainingBalance,
  }).returning();

  // Generate API key
  const apiKey = `sk_test_${randomBytes(32).toString('hex')}`;
  const encryptedSecret = encrypt(apiKey);

  const [apiKeyRecord] = await db.insert(apikeys).values({
    clientId,
    clientSecret: encryptedSecret,
  }).returning();

  return {
    clientId: user.clientId,
    email: user.email,
    remainingBalance: user.remainingBalance,
    apiKey,
    apiKeyId: apiKeyRecord.id,
  };
}

export async function createTestUsers(count: number): Promise<TestUser[]> {
  const testUsers: TestUser[] = [];
  
  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      email: `test-user-${i}@test.com`,
    });
    testUsers.push(user);
  }

  return testUsers;
}

export async function updateUserBalance(clientId: string, balance: number): Promise<void> {
  const db = await getTestDb();
  await db.update(users)
    .set({ remainingBalance: balance })
    .where(eq(users.clientId, clientId));
}
```

```typescript
// tests/integration/fixtures/test-templates.ts
import { getTestDb } from '@/libs/test-db';
import { templates } from '@/models/Schema';
import { eq, and } from 'drizzle-orm';

export type TestTemplate = {
  id: string;
  templateId: string;
  environment: 'dev' | 'prod';
  templateName: string;
  templateContent: string;
  templateSampleData: any;
};

export async function createTestTemplate(
  userEmail: string,
  overrides?: {
    templateName?: string;
    templateContent?: string;
    environment?: 'dev' | 'prod';
    templateSampleData?: any;
  }
): Promise<TestTemplate> {
  const db = await getTestDb();
  
  const templateId = `tmpl_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  const [template] = await db.insert(templates).values({
    templateId,
    email: userEmail,
    environment: overrides?.environment || 'dev',
    templateName: overrides?.templateName || 'Test Template',
    description: 'Test template description',
    templateContent: overrides?.templateContent || '<html><body>Hello {{name}}</body></html>',
    templateSampleData: overrides?.templateSampleData || { name: 'Test User' },
    templateStyle: '',
    assets: null,
  }).returning();

  return {
    id: template.id,
    templateId: template.templateId,
    environment: template.environment,
    templateName: template.templateName,
    templateContent: template.templateContent,
    templateSampleData: template.templateSampleData,
  };
}

export async function createDevAndProdTemplates(userEmail: string): Promise<{
  dev: TestTemplate;
  prod: TestTemplate;
}> {
  const templateId = `tmpl_${Date.now()}`;
  
  const dev = await createTestTemplate(userEmail, {
    environment: 'dev',
    templateName: 'Test Template (Dev)',
  });

  const prod = await createTestTemplate(userEmail, {
    environment: 'prod',
    templateName: 'Test Template (Prod)',
  });

  return { dev, prod };
}

export async function getTemplate(
  templateId: string,
  environment: 'dev' | 'prod' = 'dev'
): Promise<TestTemplate | null> {
  const db = await getTestDb();
  
  const [template] = await db.select()
    .from(templates)
    .where(
      and(
        eq(templates.templateId, templateId),
        eq(templates.environment, environment)
      )
    )
    .limit(1);

  if (!template) return null;

  return {
    id: template.id,
    templateId: template.templateId,
    environment: template.environment,
    templateName: template.templateName,
    templateContent: template.templateContent,
    templateSampleData: template.templateSampleData,
  };
}
```

```typescript
// tests/integration/helpers/test-helpers.ts
import { expect } from 'vitest';
import type { NextResponse } from 'next/server';

export async function extractResponseBody<T>(response: NextResponse): Promise<T> {
  const text = await response.text();
  
  if (!text) {
    return null as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

export async function extractPdfBuffer(response: NextResponse): Promise<Buffer> {
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export function assertPdfBuffer(buffer: Buffer): void {
  expect(buffer.length).toBeGreaterThan(0);
  
  // Check PDF magic bytes
  const header = buffer.toString('utf8', 0, 4);
  expect(header).toBe('%PDF');
}

export function assertErrorResponse(
  body: any,
  expectedStatus: number,
  errorMessagePattern?: string | RegExp
): void {
  expect(body).toHaveProperty('error');
  expect(typeof body.error).toBe('string');
  
  if (errorMessagePattern) {
    if (typeof errorMessagePattern === 'string') {
      expect(body.error).toContain(errorMessagePattern);
    } else {
      expect(body.error).toMatch(errorMessagePattern);
    }
  }
}

export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}
```

```typescript
// tests/integration/helpers/auth-helpers.ts
import type { TestUser } from '../fixtures/test-users';

export function createAuthHeaders(user: TestUser): HeadersInit {
  return {
    'client_id': user.clientId,
    'client_secret': user.apiKey,
    'Content-Type': 'application/json',
  };
}

export function createRequest(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  user?: TestUser,
  body?: any,
  additionalHeaders?: HeadersInit
): Request {
  const headers: HeadersInit = {
    ...additionalHeaders,
  };

  if (user) {
    Object.assign(headers, createAuthHeaders(user));
  }

  const requestInit: RequestInit = {
    method,
    headers,
  };

  if (body) {
    requestInit.body = JSON.stringify(body);
  }

  return new Request(url, requestInit);
}
```

**Test cases for this phase:**
```typescript
// tests/integration/fixtures/test-users.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cleanupTestDb } from '@/libs/test-db';
import { createTestUser, createTestUsers, updateUserBalance } from './test-users';
import { createTestTemplate } from './test-templates';

describe('Test Fixtures', () => {
  beforeEach(async () => {
    await cleanupTestDb();
  });

  afterEach(async () => {
    await cleanupTestDb();
  });

  describe('User Fixtures', () => {
    it('should create a test user with default values', async () => {
      const user = await createTestUser();

      expect(user.clientId).toBeTruthy();
      expect(user.email).toContain('@test.com');
      expect(user.remainingBalance).toBe(150);
      expect(user.apiKey).toMatch(/^sk_test_/);
    });

    it('should create a test user with custom values', async () => {
      const user = await createTestUser({
        email: 'custom@example.com',
        remainingBalance: 500,
      });

      expect(user.email).toBe('custom@example.com');
      expect(user.remainingBalance).toBe(500);
    });

    it('should create multiple unique users', async () => {
      const users = await createTestUsers(3);

      expect(users.length).toBe(3);
      
      const emails = users.map(u => u.email);
      const uniqueEmails = new Set(emails);
      expect(uniqueEmails.size).toBe(3);
    });

    it('should update user balance', async () => {
      const user = await createTestUser();
      await updateUserBalance(user.clientId, 200);

      const db = await getTestDb();
      const [updated] = await db.select()
        .from(users)
        .where(eq(users.clientId, user.clientId));

      expect(updated.remainingBalance).toBe(200);
    });
  });

  describe('Template Fixtures', () => {
    it('should create a test template', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate(user.email);

      expect(template.templateId).toBeTruthy();
      expect(template.environment).toBe('dev');
      expect(template.templateContent).toContain('{{name}}');
    });

    it('should create dev and prod templates with same ID', async () => {
      const user = await createTestUser();
      const { dev, prod } = await createDevAndProdTemplates(user.email);

      expect(dev.templateId).toBe(prod.templateId);
      expect(dev.environment).toBe('dev');
      expect(prod.environment).toBe('prod');
    });
  });
});
```

**Technical details and Assumptions:**
- Test users have unique client IDs with timestamps to avoid collisions
- API keys are generated using crypto.randomBytes for security
- Fixtures cleanup is handled by test suite hooks (beforeEach/afterEach)
- Test data is isolated per test to prevent cross-contamination

---

### Phase 4: Global Test Setup & Example Integration Test
**Files**: 
- `tests/integration/setup.ts` (new)
- `tests/integration/README.md` (new)
- `tests/integration/convert-api/example.test.ts` (new)
- `package.json` (update)

**Test Files**: 
- `tests/integration/convert-api/example.test.ts` (this is both implementation and test)

Create global test hooks, documentation, and a working example test demonstrating all infrastructure components.

**Key code changes:**

```typescript
// tests/integration/setup.ts
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { cleanupTestDb, closeTestDb } from '@/libs/test-db';
import { startMockJobRunner, stopMockJobRunner } from './mocks/mock-job-runner';
import { resetInngestMock, setupInngestMock } from './mocks/mock-inngest';
import { resetBlobMock, setupBlobMock } from './mocks/mock-blob';
import { resetUpstashMock, setupUpstashMock } from './mocks/mock-upstash';

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL_TEST',
  'JOB_RUNNER_BASE_URL',
  'JOB_RUNNER_TOKEN',
  'ENCRYPTION_KEY',
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(
      `Missing required environment variable: ${envVar}\n` +
      `Please copy .env.test.example to .env.test and fill in the values.`
    );
  }
});

// Global setup - runs once before all tests
beforeAll(async () => {
  console.log('🚀 Starting integration test infrastructure...');
  
  // Start mock services
  await startMockJobRunner(3001);
  
  // Setup module mocks
  setupInngestMock();
  setupBlobMock();
  setupUpstashMock();
  
  console.log('✅ Integration test infrastructure ready');
}, 30000);

// Global cleanup - runs once after all tests
afterAll(async () => {
  console.log('🧹 Cleaning up integration test infrastructure...');
  
  // Stop mock services
  await stopMockJobRunner();
  
  // Close database connections
  await closeTestDb();
  
  console.log('✅ Integration test infrastructure cleaned up');
}, 30000);

// Before each test - reset state
beforeEach(async () => {
  // Clean database
  await cleanupTestDb();
  
  // Reset mocks
  resetInngestMock();
  resetBlobMock();
  resetUpstashMock();
});

// After each test - cleanup
afterEach(async () => {
  // Additional cleanup if needed
});
```

```typescript
// tests/integration/convert-api/example.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/[locale]/convert/[templateId]/route';
import { createTestUser } from '../fixtures/test-users';
import { createTestTemplate } from '../fixtures/test-templates';
import { getMockJobRunner } from '../mocks/mock-job-runner';
import { mockInngest } from '../mocks/mock-inngest';
import { createRequest } from '../helpers/auth-helpers';
import { extractPdfBuffer, assertPdfBuffer, assertErrorResponse, extractResponseBody } from '../helpers/test-helpers';
import type { TestUser } from '../fixtures/test-users';
import type { TestTemplate } from '../fixtures/test-templates';

describe('Convert API - Example Integration Test', () => {
  let testUser: TestUser;
  let testTemplate: TestTemplate;

  beforeEach(async () => {
    // Create test data
    testUser = await createTestUser({ remainingBalance: 150 });
    testTemplate = await createTestTemplate(testUser.email, {
      templateContent: '<html><body><h1>Hello {{name}}</h1></body></html>',
      templateSampleData: { name: 'World' },
    });
  });

  it('should generate PDF successfully with valid authentication and template data', async () => {
    // Arrange
    const request = createRequest(
      `http://localhost:3000/convert/${testTemplate.templateId}`,
      'POST',
      testUser,
      {
        templateData: { name: 'Integration Test' }
      }
    );

    // Act
    const response = await POST(request, { 
      params: { templateId: testTemplate.templateId } 
    });

    // Assert response
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toContain('attachment');

    // Assert PDF content
    const pdfBuffer = await extractPdfBuffer(response);
    assertPdfBuffer(pdfBuffer);

    // Verify mock job-runner was called
    const mockJobRunner = getMockJobRunner();
    expect(mockJobRunner?.getCallCount()).toBe(1);
    
    const lastRequest = mockJobRunner?.getLastRequest();
    expect(lastRequest?.body.html).toContain('Integration Test');
    expect(lastRequest?.headers.authorization).toBe('Bearer test-token');

    // Verify no Inngest events (sync mode)
    expect(mockInngest.getEvents().length).toBe(0);
  });

  it('should return 401 for missing authentication', async () => {
    // Arrange - request without auth headers
    const request = createRequest(
      `http://localhost:3000/convert/${testTemplate.templateId}`,
      'POST',
      undefined, // No user
      { templateData: { name: 'Test' } }
    );

    // Act
    const response = await POST(request, { 
      params: { templateId: testTemplate.templateId } 
    });

    // Assert
    expect(response.status).toBe(401);
    
    const body = await extractResponseBody(response);
    assertErrorResponse(body, 401, 'authentication');
  });

  it('should return 404 for non-existent template', async () => {
    // Arrange
    const request = createRequest(
      'http://localhost:3000/convert/non-existent-template',
      'POST',
      testUser,
      { templateData: { name: 'Test' } }
    );

    // Act
    const response = await POST(request, { 
      params: { templateId: 'non-existent-template' } 
    });

    // Assert
    expect(response.status).toBe(404);
    
    const body = await extractResponseBody(response);
    assertErrorResponse(body, 404);
  });

  it('should use sample data when templateData is not provided', async () => {
    // Arrange
    const request = createRequest(
      `http://localhost:3000/convert/${testTemplate.templateId}`,
      'POST',
      testUser,
      { templateData: {} } // Empty template data
    );

    // Act
    const response = await POST(request, { 
      params: { templateId: testTemplate.templateId } 
    });

    // Assert
    expect(response.status).toBe(200);
    
    const mockJobRunner = getMockJobRunner();
    const lastRequest = mockJobRunner?.getLastRequest();
    
    // Should use sample data from template
    expect(lastRequest?.body.html).toContain('World');
  });

  it('should handle job-runner errors gracefully', async () => {
    // Arrange - configure mock to return error
    const mockJobRunner = getMockJobRunner();
    mockJobRunner?.setMockResponse('generate-pdf', 500, { 
      error: 'PDF generation failed' 
    });

    const request = createRequest(
      `http://localhost:3000/convert/${testTemplate.templateId}`,
      'POST',
      testUser,
      { templateData: { name: 'Test' } }
    );

    // Act
    const response = await POST(request, { 
      params: { templateId: testTemplate.templateId } 
    });

    // Assert
    expect(response.status).toBe(500);
    
    const body = await extractResponseBody(response);
    assertErrorResponse(body, 500);

    // Cleanup mock
    mockJobRunner?.clearMockResponses();
  });
});
```

```markdown
<!-- tests/integration/README.md -->
# Integration Tests

This directory contains integration tests for the Templify dashboard API. Integration tests validate the interaction between multiple components (API routes, database, external services) in an isolated test environment.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Test Database

**Option A: Docker Compose (Recommended)**

```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d

# Verify database is running
docker-compose -f docker-compose.test.yml ps
```

**Option B: Local PostgreSQL**

```bash
# Create test database
createdb templify_test

# Or using psql
psql -U postgres -c "CREATE DATABASE templify_test;"
```

### 3. Configure Environment Variables

```bash
# Copy example env file
cp .env.test.example .env.test

# Edit .env.test with your values
# DATABASE_URL_TEST=postgresql://test:test@localhost:5433/templify_test
```

### 4. Run Database Migrations

```bash
npm run db:migrate:test
```

## Running Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific test file
npm run test:integration tests/integration/convert-api/example.test.ts

# Run tests in watch mode
npm run test:integration:watch

# Run with coverage
npm run test:integration -- --coverage
```

## Writing Integration Tests

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestUser } from '../fixtures/test-users';
import { createTestTemplate } from '../fixtures/test-templates';

describe('My Feature', () => {
  let testUser: TestUser;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  it('should do something', async () => {
    // Arrange - setup test data
    const template = await createTestTemplate(testUser.email);

    // Act - perform action
    const result = await myFunction(template.id);

    // Assert - verify results
    expect(result).toBeDefined();
  });
});
```

### Available Fixtures

**User Fixtures** (`tests/integration/fixtures/test-users.ts`)
- `createTestUser(overrides?)` - Create a test user with API credentials
- `createTestUsers(count)` - Create multiple test users
- `updateUserBalance(clientId, balance)` - Update user credit balance

**Template Fixtures** (`tests/integration/fixtures/test-templates.ts`)
- `createTestTemplate(userEmail, overrides?)` - Create a test template
- `createDevAndProdTemplates(userEmail)` - Create dev/prod template pair
- `getTemplate(templateId, environment)` - Retrieve template by ID

### Available Helpers

**Auth Helpers** (`tests/integration/helpers/auth-helpers.ts`)
- `createAuthHeaders(user)` - Generate authentication headers
- `createRequest(url, method, user?, body?, headers?)` - Create authenticated request

**Test Helpers** (`tests/integration/helpers/test-helpers.ts`)
- `extractResponseBody<T>(response)` - Parse JSON response body
- `extractPdfBuffer(response)` - Extract PDF buffer from response
- `assertPdfBuffer(buffer)` - Validate PDF format
- `assertErrorResponse(body, status, pattern?)` - Assert error format
- `waitFor(condition, timeout?)` - Wait for async condition

### Mock Services

**Mock Job Runner** - Simulates PDF generation service
```typescript
import { getMockJobRunner } from '../mocks/mock-job-runner';

const mock = getMockJobRunner();
mock?.getCallCount(); // Number of requests
mock?.getLastRequest(); // Last request details
mock?.setMockResponse('generate-pdf', 500, { error: 'Test error' });
```

**Mock Inngest** - Captures background job events
```typescript
import { mockInngest } from '../mocks/mock-inngest';

const events = mockInngest.getEventsByName('pdf/generate.async');
expect(mockInngest.wasEventSent('webhook/send')).toBe(true);
```

**Mock Blob Storage** - Simulates Vercel Blob
```typescript
import { mockBlob } from '../mocks/mock-blob';

expect(mockBlob.wasUploaded('generated-pdf/test.pdf')).toBe(true);
const upload = mockBlob.getUpload('path/to/file');
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if database is running
docker-compose -f docker-compose.test.yml ps

# View logs
docker-compose -f docker-compose.test.yml logs postgres-test

# Restart database
docker-compose -f docker-compose.test.yml restart
```

### Test Timeout Errors

Integration tests have a 30-second timeout. If tests are timing out:
- Check database connection
- Verify mock services are running
- Check for database locks (ensure proper cleanup)

### Port Conflicts

If port 3001 (mock job-runner) or 5433 (test database) are in use:
- Update ports in `vitest.integration.config.mts`
- Update ports in `docker-compose.test.yml`
- Update ports in `.env.test`

### Clean State

If tests are failing due to stale data:
```bash
# Clean database manually
npm run db:reset:test

# Or restart Docker containers
docker-compose -f docker-compose.test.yml down -v
docker-compose -f docker-compose.test.yml up -d
```

## CI/CD

Integration tests run automatically in GitHub Actions on pull requests. See `.github/workflows/integration-tests.yml` for configuration.

## Best Practices

1. **Isolation** - Each test should be independent and not rely on other tests
2. **Cleanup** - Use `beforeEach`/`afterEach` to ensure clean state
3. **Realistic Data** - Use fixtures that mirror production data structures
4. **Clear Assertions** - Use descriptive error messages
5. **Performance** - Keep tests fast (< 10 seconds per test)
6. **Coverage** - Test both happy paths and error scenarios
```

**Test cases for this phase:**
The example.test.ts file itself serves as the test for this phase, demonstrating:
- ✅ Successful PDF generation with authentication
- ✅ 401 error for missing authentication
- ✅ 404 error for non-existent template
- ✅ Sample data fallback when templateData is empty
- ✅ Error handling for job-runner failures
- ✅ Mock verification for all external calls
- ✅ Database cleanup between tests

**Technical details and Assumptions:**
- Global setup runs once per test suite, not per test
- Mock services persist across tests but state is reset
- Environment validation happens at test suite startup
- README provides comprehensive onboarding for new developers

---

### Phase 5: CI/CD Integration & Package Scripts
**Files**: 
- `.github/workflows/integration-tests.yml` (new)
- `docker-compose.test.yml` (new)
- `package.json` (update)
- `README.md` (update)

**Test Files**: 
- None (infrastructure validation via CI)

Configure GitHub Actions workflow and package scripts to run integration tests in CI/CD pipeline.

**Key code changes:**

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on:
  pull_request:
    branches: [main, develop]
    paths:
      - 'src/**'
      - 'tests/integration/**'
      - 'package.json'
      - 'vitest.integration.config.mts'
  push:
    branches: [main, develop]
  workflow_dispatch:

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 15

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
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup test environment
        run: |
          cp .env.test.example .env.test
          echo "DATABASE_URL_TEST=postgresql://test:test@localhost:5432/templify_test" >> .env.test

      - name: Run database migrations
        env:
          DATABASE_URL_TEST: postgresql://test:test@localhost:5432/templify_test
        run: npm run db:migrate:test

      - name: Run integration tests
        env:
          DATABASE_URL_TEST: postgresql://test:test@localhost:5432/templify_test
          JOB_RUNNER_BASE_URL: http://localhost:3001
          JOB_RUNNER_TOKEN: test-token-ci
          ENCRYPTION_KEY: test-encryption-key-32chars!!
          KV_REST_API_URL: http://localhost:8079
          KV_REST_API_TOKEN: test-token
          NODE_ENV: test
        run: npm run test:integration

      - name: Upload test coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: integration-test-coverage
          path: coverage/
          retention-days: 7

      - name: Comment PR with results
        if: github.event_name == 'pull_request' && failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '❌ Integration tests failed. Please check the workflow logs for details.'
            })
```

```yaml
# docker-compose.test.yml
version: '3.8'

services:
  postgres-test:
    image: postgres:15-alpine
    container_name: templify-test-db
    environment:
      POSTGRES_DB: templify_test
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    ports:
      - "5433:5432"
    volumes:
      - test-db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  test-db-data:
    driver: local
```

```json
// package.json - Add these scripts
{
  "scripts": {
    "test:integration": "vitest run --config vitest.integration.config.mts",
    "test:integration:watch": "vitest --config vitest.integration.config.mts",
    "test:integration:ui": "vitest --ui --config vitest.integration.config.mts",
    "test:integration:coverage": "vitest run --coverage --config vitest.integration.config.mts",
    "db:migrate:test": "dotenv -e .env.test -- drizzle-kit migrate --config=drizzle.config.test.ts",
    "db:reset:test": "dotenv -e .env.test -- tsx scripts/reset-test-db.ts",
    "test:all": "npm run test && npm run test:integration"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "express": "^4.18.2"
  }
}
```

```markdown
<!-- README.md - Add this section -->

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests

Integration tests validate API routes, database interactions, and external service integrations.

**Setup:**
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

See [tests/integration/README.md](tests/integration/README.md) for detailed documentation.

### E2E Tests
```bash
npm run test:e2e
```

### All Tests
```bash
npm run test:all
```
```

```typescript
// scripts/reset-test-db.ts
import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.test' });

async function resetTestDb() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL_TEST!,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🗑️  Dropping all tables...');
    
    await pool.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO test;
      GRANT ALL ON SCHEMA public TO public;
    `);

    console.log('✅ Test database reset successfully');
  } catch (error) {
    console.error('❌ Error resetting test database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetTestDb();
```

**Technical details and Assumptions:**
- GitHub Actions uses PostgreSQL service container
- Tests run sequentially in CI to avoid resource contention
- Coverage reports are uploaded as artifacts
- Workflow only runs when relevant files change (optimized for speed)
- Test database is ephemeral in CI (created fresh each run)

**Success Criteria for Phase 5:**
- ✅ Integration tests run successfully in GitHub Actions
- ✅ Test results appear in PR status checks
- ✅ Coverage reports are generated and uploaded
- ✅ Failed tests block PR merging
- ✅ Developers can run tests locally with docker-compose

---

## Technical Considerations

### Dependencies
**New packages required:**
```json
{
  "devDependencies": {
    "@types/express": "^4.17.21",
    "express": "^4.18.2",
    "dotenv-cli": "^7.3.0"
  }
}
```

### Edge Cases
- **Database connection failures**: Tests fail fast with clear error messages
- **Port conflicts**: Mock services use non-standard ports (3001, 5433)
- **Parallel test execution**: Initially sequential, can be optimized with database transactions
- **Test data leakage**: Cleanup happens in both beforeEach and afterEach hooks
- **Mock service crashes**: Global afterAll ensures cleanup even if tests fail

### Testing Strategy
Each phase includes comprehensive unit tests validating its own functionality before proceeding to the next phase. The final example test demonstrates end-to-end integration of all components.

### Performance
- **Test database setup**: < 5 seconds
- **Single test execution**: < 10 seconds
- **Full integration suite**: < 2 minutes (will grow with more tests)
- **CI/CD pipeline**: < 5 minutes (including setup and cleanup)

### Security
- Test database credentials are separate from production
- API keys are randomly generated per test run
- Encryption keys are static test values (not production secrets)
- Mock services only run on localhost
- No production services are called during tests

## Success Criteria

✅ **AC1-AC12 Validation:**
- [ ] Test database provisions successfully with migrations
- [ ] Integration test directory structure matches specification
- [ ] Mock job-runner validates auth and returns PDF bytes
- [ ] Mock Inngest captures events without executing functions
- [ ] Mock Blob storage tracks uploads/deletes
- [ ] User and template fixtures create valid test data
- [ ] Helper utilities simplify common test operations
- [ ] Example test passes consistently
- [ ] Vitest configuration runs integration tests separately
- [ ] GitHub Actions workflow passes on clean repo
- [ ] Environment variables are documented and validated
- [ ] README provides clear setup and usage instructions

✅ **NFR Validation:**
- [ ] Test setup completes in < 5 seconds
- [ ] Example test executes in < 10 seconds
- [ ] Tests are isolated (can run in any order)
- [ ] Developer experience is streamlined (clear errors, good docs)

## Next Steps

After this infrastructure is complete:
1. **Story 1**: Write sync PDF generation regression tests
2. **Story 2**: Write async PDF generation integration tests
3. **Story 3**: Write rate limiting and error handling tests
4. **Story 4**: Write webhook delivery integration tests

Each subsequent story will leverage this infrastructure to add comprehensive test coverage for the convert API.
