# TypeScript & Next.js Coding Guidelines - Templify

This document provides TypeScript and Next.js specific coding standards for the Templify project. It extends the [core-standards.md](core-standards.md) with framework-specific best practices.

**Always read [core-standards.md](core-standards.md) first** - this document assumes those principles.

---

## Table of Contents
- [Project Context](#project-context)
- [TypeScript Standards](#typescript-standards)
- [Next.js App Router Patterns](#nextjs-app-router-patterns)
- [API Routes & Server Actions](#api-routes--server-actions)
- [Database Layer (Drizzle ORM)](#database-layer-drizzle-orm)
- [Background Jobs (Inngest)](#background-jobs-inngest)
- [Component Standards](#component-standards)
- [State Management](#state-management)
- [Error Handling & Observability](#error-handling--observability)
- [Testing Standards](#testing-standards)
- [Security Best Practices](#security-best-practices)
- [Performance Guidelines](#performance-guidelines)

---

## Project Context

### Stack Overview
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **Database**: PostgreSQL (via Neon) with Drizzle ORM
- **Background Jobs**: Inngest for orchestration
- **Auth**: Clerk
- **Storage**: Vercel Blob
- **Rate Limiting**: Upstash Redis
- **Observability**: Sentry (errors), PostHog (analytics)
- **Styling**: Tailwind CSS + shadcn/ui components

### Project Structure
```
src/
├── app/                    # Next.js App Router pages & API routes
├── components/             # React components
├── libs/                   # Business logic, actions, services
├── inngest/               # Background job functions
├── models/                # Database schema (Drizzle)
├── hooks/                 # React hooks
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── middleware.ts          # Next.js middleware
```

---

## TypeScript Standards

### Type Definitions

**Use `type` over `interface`** (enforced by ESLint)
```typescript
// ✅ Good
type User = {
  id: string;
  email: string;
  createdAt: Date;
};

// ❌ Avoid
type User = {
  id: string;
  email: string;
};
```

**Always define explicit return types for functions**
```typescript
// ✅ Good
async function fetchUser(id: string): Promise<User | null> {
  // ...
}

// ❌ Avoid
async function fetchUser(id: string) {
  // Type inference can be unclear
}
```

**Use strict null checks**
```typescript
// ✅ Good - handle null explicitly
const user = await fetchUser(id);
if (!user) {
  throw new Error('User not found');
}
return user.email;

// ❌ Avoid
const user = await fetchUser(id);
return user!.email; // Never use non-null assertion unless absolutely necessary
```

**Prefer readonly for immutable data**
```typescript
// ✅ Good
type Config = {
  readonly apiUrl: string;
  readonly timeout: number;
};
```

**Use discriminated unions for complex state**
```typescript
// ✅ Good
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

function handleResponse<T>(response: ApiResponse<T>) {
  if (response.success) {
    // TypeScript knows response.data exists
    return response.data;
  }
  // TypeScript knows response.error exists
  throw new Error(response.error.message);
}
```

**Avoid `any` - use `unknown` when type is truly unknown**
```typescript
// ✅ Good
function parseJson(input: string): unknown {
  return JSON.parse(input);
}

const result = parseJson(input);
// Must validate before using
if (typeof result === 'object' && result !== null) {
  // Safe to use
}

// ❌ Avoid
function parseJson(input: string): any {
  return JSON.parse(input);
}
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Variables/Functions | camelCase | `generatePdf`, `templateData` |
| Types/Interfaces | PascalCase | `TemplateData`, `ApiResponse` |
| React Components | PascalCase | `TemplateEditor`, `UsageChart` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_VERSION` |
| Private/Internal | prefix `_` | `_internalHelper` |
| Async Functions | prefix `async` or suffix verb | `fetchUser`, `generatePdfAsync` |
| Boolean variables | prefix `is/has/should` | `isValid`, `hasAccess`, `shouldRetry` |
| Handlers | prefix `handle/on` | `handleSubmit`, `onClick` |

---

## Next.js App Router Patterns

### File Organization

**Route structure**
```
app/
├── [locale]/              # Internationalization wrapper
│   ├── (auth)/           # Route group for authenticated routes
│   │   └── dashboard/
│   ├── api/              # API routes
│   │   ├── user/
│   │   │   └── route.ts
│   │   └── inngest/
│   │       └── route.ts
│   └── convert/          # Public API routes
│       └── [templateId]/
│           └── route.ts
```

**Naming conventions**
- Route handlers: `route.ts`
- Page components: `page.tsx`
- Layouts: `layout.tsx`
- Loading states: `loading.tsx`
- Error boundaries: `error.tsx`

### Server vs Client Components

**Default to Server Components** - use Client Components only when needed

```typescript
// ✅ Good - Server Component (default)
// app/dashboard/page.tsx
import { fetchTemplates } from '@/libs/actions/templates';

export default async function DashboardPage() {
  const templates = await fetchTemplates();
  return <TemplateList templates={templates} />;
}
```

**Use Client Components for:**
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `window`)
- React hooks (`useState`, `useEffect`)
- Third-party libraries requiring client-side JS

```typescript
// ✅ Good - explicit client directive
'use client';

import { useState } from 'react';

export function TemplateEditor() {
  const [content, setContent] = useState('');
  // ...
}
```

### Metadata & SEO

**Define metadata for each page**
```typescript
// ✅ Good
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Templify',
  description: 'Manage your PDF templates',
};
```

---

## API Routes & Server Actions

### API Route Structure

**Pattern**: One route handler per HTTP method

```typescript
// app/api/user/route.ts
import { type NextRequest, NextResponse } from 'next/server';

import { authenticateApi } from '../authenticateApi';

export async function GET(req: NextRequest): Promise<NextResponse> {
  // 1. Authenticate
  const authResult = await authenticateApi(req);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // 2. Validate input
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    );
  }

  // 3. Business logic
  const user = await fetchUserById(userId);

  // 4. Return response
  return NextResponse.json({ user }, { status: 200 });
}
```

**Error Response Format** (must be consistent)
```typescript
type ErrorResponse = {
  error: string; // User-facing message
  code?: string; // Machine-readable error code
  details?: unknown; // Optional additional context
};

// ✅ Good - consistent error format
return NextResponse.json(
  {
    error: 'Template not found',
    code: 'TEMPLATE_NOT_FOUND',
  },
  { status: 404 }
);
```

**Success Response Format**
```typescript
// ✅ Good - wrap data in object for extensibility
return NextResponse.json(
  {
    data: template,
    meta: { generatedAt: Date.now() }
  },
  { status: 200 }
);

// ❌ Avoid - returning raw data limits future changes
return NextResponse.json(template);
```

### Authentication Pattern

**Reusable auth middleware**
```typescript
// app/api/authenticateApi.ts
export async function authenticateApi(req: NextRequest): Promise<NextResponse | { clientId: string }> {
  const clientId = req.headers.get('client_id');
  const clientSecret = req.headers.get('client_secret');

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Missing authentication headers' },
      { status: 401 }
    );
  }

  // Validate credentials...
  const isValid = await validateCredentials(clientId, clientSecret);
  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  return { clientId };
}
```

**Usage in route**
```typescript
export const POST = async (req: NextRequest) => {
  const authResult = await authenticateApi(req);
  if (authResult instanceof NextResponse) {
    return authResult; // Return error response
  }

  const { clientId } = authResult;
  // Continue with authenticated request...
};
```

### Rate Limiting Pattern

**Implement per-user rate limiting**
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(4, '60 s'),
  analytics: true,
});

// In route handler
const { success } = await ratelimit.limit(`user:${clientId}`);
if (!success) {
  return NextResponse.json(
    { error: 'Rate limit exceeded. Try again later.' },
    { status: 429 }
  );
}
```

### Server Actions

**Use for mutations from Client Components**
```typescript
// libs/actions/templates.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createTemplate(data: TemplateInput): Promise<{
  success: boolean;
  templateId?: string;
  error?: string;
}> {
  try {
    // Validate
    if (!data.templateContent) {
      return { success: false, error: 'Template content is required' };
    }

    // Create
    const template = await db.insert(templates).values(data).returning();

    // Revalidate cache
    revalidatePath('/dashboard/templates');

    return { success: true, templateId: template[0].templateId };
  } catch (error) {
    logger.error('Failed to create template', { error });
    return { success: false, error: 'Failed to create template' };
  }
}
```

---

## Database Layer (Drizzle ORM)

### Schema Definition

**Use Drizzle schema patterns**
```typescript
// models/Schema.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: text('template_id').notNull(),
  environment: text('environment').notNull(), // 'dev' | 'prod'
  templateContent: text('template_content').notNull(),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
```

**Relations**
```typescript
import { relations } from 'drizzle-orm';

export const templatesRelations = relations(templates, ({ one, many }) => ({
  user: one(users, {
    fields: [templates.userId],
    references: [users.clientId],
  }),
  generations: many(generatedTemplates),
}));
```

### Query Patterns

**Keep database queries in `libs/actions/` or service layer**
```typescript
// libs/actions/templates.ts
import { and, eq } from 'drizzle-orm';

import { db } from '@/libs/DB';
import { templates } from '@/models/Schema';

export async function fetchTemplateById(
  templateId: string,
  environment: 'dev' | 'prod' = 'dev'
): Promise<Template | null> {
  const [template] = await db
    .select()
    .from(templates)
    .where(
      and(
        eq(templates.templateId, templateId),
        eq(templates.environment, environment)
      )
    )
    .limit(1);

  return template ?? null;
}
```

**Use transactions for multi-step operations**
```typescript
import { db } from '@/libs/DB';

export async function promoteTemplate(templateId: string) {
  await db.transaction(async (tx) => {
    // 1. Fetch dev template
    const [devTemplate] = await tx
      .select()
      .from(templates)
      .where(
        and(
          eq(templates.templateId, templateId),
          eq(templates.environment, 'dev')
        )
      );

    if (!devTemplate) {
      throw new Error('Dev template not found');
    }

    // 2. Upsert to prod
    await tx
      .insert(templates)
      .values({
        ...devTemplate,
        environment: 'prod',
      })
      .onConflictDoUpdate({
        target: [templates.templateId, templates.environment],
        set: { templateContent: devTemplate.templateContent },
      });
  });
}
```

**Avoid N+1 queries**
```typescript
// ❌ Bad - N+1 query
const templates = await fetchAllTemplates();
for (const template of templates) {
  const user = await fetchUserById(template.userId); // Separate query per template
}

// ✅ Good - single query with join
const templatesWithUsers = await db
  .select()
  .from(templates)
  .leftJoin(users, eq(templates.userId, users.clientId));
```

---

## Background Jobs (Inngest)

### Function Structure

**Pattern**: One function per event type
```typescript
// inngest/functions/generatePdfAsync/index.ts
import { inngest } from '@/inngest/client';

export const generatePdfAsync = inngest.createFunction(
  {
    id: 'pdf/generate.async',
    name: 'Generate PDF (Async)',
  },
  { event: 'pdf/generate.async' },
  async ({ event, step, runId }) => {
    // 1. Send start notification
    await step.sendEvent('webhook.started', {
      name: 'webhook/send',
      data: { /* ... */ },
    });

    // 2. Execute main work with error handling
    let pdfBuffer: ArrayBuffer;
    try {
      const result = await generatePdf(event.data);
      if (result.error) {
        throw new Error(result.error.message);
      }
      pdfBuffer = result.pdf;
    } catch (err) {
      // 3. Send failure notification
      await step.sendEvent('webhook.failed', { /* ... */ });
      throw err; // Re-throw for Inngest retry
    }

    // 4. Upload result
    const url = await step.run('upload-pdf', async () => {
      return await put(`generated-pdf/${runId}.pdf`, pdfBuffer);
    });

    // 5. Send success notification
    await step.sendEvent('webhook.success', {
      name: 'webhook/send',
      data: { download_url: url },
    });

    return { url, status: 'completed' };
  }
);
```

### Event Typing

**Define strict event types**
```typescript
// inngest/types.ts
export type Events = {
  'pdf/generate.async': {
    data: {
      clientId: string;
      templateId: string;
      templateData: Record<string, unknown>;
      devMode: boolean;
      endpointId: string;
      endpointUrl: string;
      encryptedSecret: string;
    };
  };
  'webhook/send': {
    data: {
      clientId: string;
      type: 'pdf.started' | 'pdf.generated' | 'pdf.failed';
      meta: Record<string, unknown>;
      endpointId: string;
      endpointUrl: string;
      encryptedSecret: string;
    };
  };
};

// Use in client
export const inngest = new Inngest<Events>({ id: 'templify' });
```

### Error Handling in Jobs

**Throw errors for automatic retries**
```typescript
// ✅ Good - Inngest will retry
await step.run('generate-pdf', async () => {
  const result = await callExternalService();
  if (!result.success) {
    throw new Error('Service call failed'); // Will retry
  }
  return result.data;
});

// ❌ Avoid - swallows error, no retry
await step.run('generate-pdf', async () => {
  const result = await callExternalService();
  if (!result.success) {
    console.error('Failed'); // Job will succeed despite failure
    return null;
  }
  return result.data;
});
```

**Use step.sleep for delays**
```typescript
// ✅ Good
await step.sleep('wait-before-retry', '5s');

// ❌ Avoid - blocks function execution
await new Promise(resolve => setTimeout(resolve, 5000));
```

---

## Component Standards

### Component Structure

**Organize components by feature/domain**
```
components/
├── template/              # Template-specific components
│   ├── TemplateEditor.tsx
│   ├── TemplateGallery.tsx
│   └── PDFExtractor.tsx
├── analytics/             # Analytics tracking
│   └── PageViewTracker.tsx
├── ui/                    # shadcn/ui components
│   ├── button.tsx
│   └── dialog.tsx
└── shared/                # Truly shared components
    ├── AsyncActionButton.tsx
    └── CodeSnippet.tsx
```

### Component Template

```typescript
'use client'; // Only if needed

import { type ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';

type TemplateEditorProps = {
  templateId: string;
  initialContent?: string;
  onSave?: (content: string) => Promise<void>;
  children?: ReactNode;
};

export function TemplateEditor({
  templateId,
  initialContent = '',
  onSave,
  children,
}: TemplateEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.(content);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-96 rounded border p-4"
      />
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save'}
      </Button>
      {children}
    </div>
  );
}
```

### Props Best Practices

**Destructure props in function signature**
```typescript
// ✅ Good
export function Card({ title, children }: CardProps) {
  return <div>{title}{children}</div>;
}

// ❌ Avoid
export function Card(props: CardProps) {
  return <div>{props.title}{props.children}</div>;
}
```

**Use optional callbacks with `?.`**
```typescript
// ✅ Good
onClick?.(event);

// ❌ Avoid
if (onClick) {
  onClick(event);
}
```

**Provide sensible defaults**
```typescript
type ButtonProps = {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  // ...
}
```

### Hooks

**Custom hooks must start with `use`**
```typescript
// hooks/useTemplateEditor.ts
export function useTemplateEditor(templateId: string) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplate(templateId).then(setContent).finally(() => setIsLoading(false));
  }, [templateId]);

  return { content, setContent, isLoading };
}
```

**Keep hooks focused (SRP)**
```typescript
// ✅ Good - single responsibility
export function useDebounce<T>(value: T, delay: number): T;
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void];

// ❌ Avoid - doing too much
export function useEverything() {
  // Handles state, API calls, localStorage, debouncing, etc.
}
```

---

## State Management

### Server State (React Query pattern)

**Prefer server components for data fetching**
```typescript
// ✅ Good - Server Component
export default async function TemplatePage({ params }: { params: { id: string } }) {
  const template = await fetchTemplateById(params.id);

  if (!template) {
    notFound();
  }

  return <TemplateView template={template} />;
}
```

**For client-side data needs, use SWR or React Query**
```typescript
'use client';

import useSWR from 'swr';

export function TemplateList() {
  const { data, error, isLoading } = useSWR('/api/templates', fetcher);

  if (error) return <ErrorState error={error} />;
  if (isLoading) return <LoadingState />;

  return <List templates={data} />;
}
```

### Client State

**Use useState for simple local state**
```typescript
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({ name: '', email: '' });
```

**Use useReducer for complex state logic**
```typescript
type State = {
  step: number;
  data: Record<string, unknown>;
  errors: Record<string, string>;
};

type Action =
  | { type: 'NEXT_STEP' }
  | { type: 'SET_FIELD'; field: string; value: unknown }
  | { type: 'SET_ERROR'; field: string; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, step: state.step + 1 };
    case 'SET_FIELD':
      return {
        ...state,
        data: { ...state.data, [action.field]: action.value }
      };
    default:
      return state;
  }
}
```

**Use Context sparingly** - only for truly global state
```typescript
// contexts/TemplateContext.tsx
'use client';

import { createContext, useContext, type ReactNode } from 'react';

type TemplateContextValue = {
  templateId: string;
  environment: 'dev' | 'prod';
};

const TemplateContext = createContext<TemplateContextValue | null>(null);

export function TemplateProvider({
  children,
  value
}: {
  children: ReactNode;
  value: TemplateContextValue;
}) {
  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplate must be used within TemplateProvider');
  }
  return context;
}
```

---

## Error Handling & Observability

### Structured Logging

**Use the project logger (Pino via Sentry)**
```typescript
import { logger } from '@/libs/Logger';

// ✅ Good - structured logging
logger.info('Template created', {
  templateId,
  userId,
  environment
});

logger.error('PDF generation failed', {
  templateId,
  error: error.message,
  stack: error.stack,
});

// ❌ Avoid - console.log in production code
console.log('Template created:', templateId);
```

**Log levels**
- `debug`: Development/debugging info
- `info`: Normal business events (created, updated, deleted)
- `warn`: Recoverable errors or unexpected states
- `error`: Failures requiring attention
- `fatal`: System-level failures

### Sentry Integration

**Capture exceptions with context**
```typescript
import * as Sentry from '@sentry/nextjs';

try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      operation: 'pdf-generation',
      templateId,
    },
    extra: {
      templateData,
      userId,
    },
  });

  throw error; // Re-throw after capturing
}
```

**Set user context for debugging**
```typescript
Sentry.setUser({
  id: userId,
  email: userEmail,
});
```

### PostHog Analytics

**Track business events**
```typescript
import { trackServerEvent } from '@/libs/analytics/posthog-server';

// Track conversion events
await trackServerEvent({
  distinctId: clientId,
  event: 'pdf_generated',
  properties: {
    templateId,
    mode: 'async',
    duration_ms: Date.now() - start,
    success: true,
  },
});

// Track failures
await trackServerEvent({
  distinctId: clientId,
  event: 'pdf_generation_failed',
  properties: {
    templateId,
    error_code: 'RENDER_TIMEOUT',
    error_message: error.message,
  },
});
```

**Events to track**
- User actions (created, updated, deleted)
- API calls (success/failure)
- Feature usage
- Conversion events
- Errors (with error codes)

### Error Boundaries

**Wrap error-prone components**
```typescript
// app/dashboard/error.tsx
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-xl font-semibold">Something went wrong!</h2>
      <button onClick={reset} className="rounded bg-blue-500 px-4 py-2 text-white">
        Try again
      </button>
    </div>
  );
}
```

---

## Testing Standards

### Unit Tests (Vitest)

**Test file naming**: `*.test.ts(x)`
```
src/
└── components/
    ├── Button.tsx
    └── Button.test.tsx
```

**Test structure**: Arrange-Act-Assert
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TemplateEditor } from './TemplateEditor';

describe('TemplateEditor', () => {
  it('should render with initial content', () => {
    // Arrange
    const initialContent = 'Hello {{name}}';

    // Act
    render(<TemplateEditor initialContent={initialContent} />);

    // Assert
    expect(screen.getByRole('textbox')).toHaveValue(initialContent);
  });

  it('should call onSave when save button is clicked', async () => {
    // Arrange
    const onSave = vi.fn();
    render(<TemplateEditor onSave={onSave} />);

    // Act
    await userEvent.type(screen.getByRole('textbox'), 'New content');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    // Assert
    expect(onSave).toHaveBeenCalledWith('New content');
  });
});
```

**Mock external dependencies**
```typescript
import { vi } from 'vitest';

// Mock module
vi.mock('@/libs/actions/templates', () => ({
  fetchTemplateById: vi.fn(),
  createTemplate: vi.fn(),
}));

// Mock function
const mockFetch = vi.fn();
global.fetch = mockFetch;
```

**Limit assertions per test**: Maximum 3 assertions
```typescript
// ✅ Good
it('should validate email format', () => {
  const result = validateEmail('invalid');

  expect(result.isValid).toBe(false);
  expect(result.error).toBe('Invalid email format');
});

// ❌ Avoid - too many assertions
it('should handle entire form submission', () => {
  // 10+ assertions testing multiple things
});
```

### Integration Tests

**Test API routes**
```typescript
import { describe, expect, it } from 'vitest';

import { POST } from './route';

describe('POST /api/templates', () => {
  it('should create template with valid data', async () => {
    const req = new Request('http://localhost/api/templates', {
      method: 'POST',
      headers: {
        client_id: 'test-client',
        client_secret: 'test-secret',
      },
      body: JSON.stringify({
        templateData: { name: 'Invoice' },
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.templateId).toBeDefined();
  });

  it('should return 401 for invalid credentials', async () => {
    const req = new Request('http://localhost/api/templates', {
      method: 'POST',
      headers: {
        client_id: 'invalid',
        client_secret: 'invalid',
      },
    });

    const response = await POST(req);

    expect(response.status).toBe(401);
  });
});
```

### E2E Tests (Playwright)

**Test file naming**: `*.spec.ts` or `*.e2e.ts`

```typescript
import { expect, test } from '@playwright/test';

test.describe('Template Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('should create new template', async ({ page }) => {
    await page.goto('/dashboard/templates');
    await page.click('text=Create Template');

    await page.fill('[name="templateName"]', 'Invoice');
    await page.fill('[name="templateContent"]', '<html>{{content}}</html>');
    await page.click('button:has-text("Save")');

    await expect(page.locator('text=Template created')).toBeVisible();
  });
});
```

---

## Security Best Practices

### Environment Variables

**Validate at startup with @t3-oss/env-nextjs**
```typescript
// libs/Env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    ENCRYPTION_KEY: z.string().min(32),
    JOB_RUNNER_TOKEN: z.string(),
    CLERK_SECRET_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    // ...
  },
});
```

**Never expose secrets in client**
```typescript
// ✅ Good - server only
import { env } from '@/libs/Env';
const secret = env.ENCRYPTION_KEY;

// ❌ Avoid - exposed to client
const secret = process.env.ENCRYPTION_KEY; // If used in client component
```

### Data Encryption

**Encrypt sensitive data at rest**
```typescript
// service/crypto.ts
import crypto from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

export function encrypt(text: string): string {
  return crypto.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

export function decrypt(ciphertext: string): string {
  const bytes = crypto.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(crypto.enc.Utf8);
}
```

**Use for**: API keys, webhook secrets, OAuth tokens

### Webhook Security

**Always verify webhook signatures**
```typescript
import crypto from 'node:crypto';

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

### Input Validation

**Validate all user input**
```typescript
import { z } from 'zod';

const TemplateSchema = z.object({
  templateId: z.string().uuid(),
  templateContent: z.string().min(1).max(100000),
  templateData: z.record(z.unknown()),
});

export async function createTemplate(input: unknown) {
  // Validate
  const parsed = TemplateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Invalid input', details: parsed.error };
  }

  // Use validated data
  const { templateId, templateContent } = parsed.data;
  // ...
}
```

### SQL Injection Prevention

**Drizzle ORM prevents SQL injection by default**
```typescript
// ✅ Good - Drizzle uses parameterized queries
await db
  .select()
  .from(templates)
  .where(eq(templates.templateId, userInput)); // Safe

// ❌ Avoid - raw SQL with user input
await db.execute(`SELECT * FROM templates WHERE id = '${userInput}'`); // Dangerous
```

---

## Performance Guidelines

### Database Performance

**Create indexes for frequently queried columns**
```typescript
// models/Schema.ts
export const templates = pgTable('templates', {
  // ...
}, table => ({
  templateIdIdx: index('template_id_idx').on(table.templateId),
  userIdIdx: index('user_id_idx').on(table.userId),
}));
```

**Use pagination for large result sets**
```typescript
export async function fetchTemplates(
  userId: string,
  page: number = 1,
  pageSize: number = 20
) {
  const offset = (page - 1) * pageSize;

  return await db
    .select()
    .from(templates)
    .where(eq(templates.userId, userId))
    .limit(pageSize)
    .offset(offset);
}
```

**Select only needed columns**
```typescript
// ✅ Good
await db
  .select({
    id: templates.id,
    templateId: templates.templateId,
  })
  .from(templates);

// ❌ Avoid when only few fields needed
await db.select().from(templates); // Fetches all columns
```

### Image Optimization

**Use Next.js Image component**
```typescript
import Image from 'next/image';

// ✅ Good - automatic optimization
<Image
  src="/template-preview.png"
  alt="Template preview"
  width={800}
  height={600}
  priority={false} // Only true for above-the-fold images
/>

// ❌ Avoid
<img src="/template-preview.png" alt="Preview" />
```

### Lazy Loading

**Code splitting with dynamic imports**
```typescript
import dynamic from 'next/dynamic';

// ✅ Good - load heavy component only when needed
const TemplateEditor = dynamic(() => import('@/components/template/TemplateEditor'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // If component uses browser APIs
});
```

### Caching

**Use Next.js caching strategies**
```typescript
// Cache for 1 hour
// Or dynamic revalidation
import { revalidatePath, revalidateTag } from 'next/cache';

export const revalidate = 3600;

export async function updateTemplate(id: string) {
  // Update in database
  await db.update(templates).set({ /* ... */ });

  // Invalidate cache
  revalidatePath(`/templates/${id}`);
}
```

---

## Additional Guidelines

### Import Organization (enforced by ESLint)

```typescript
// 1. External packages
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { fetchTemplateById } from '@/libs/actions/templates';
// 2. Internal absolute imports (@/ aliases)
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';

// 3. Relative imports
import { authenticateApi } from '../authenticateApi';
import type { Template } from './types';
```

### Comments

**Use comments to explain WHY, not WHAT**
```typescript
// ✅ Good - explains reasoning
// We need to wait 5 seconds before checking job status
// because the external service has eventual consistency
await step.sleep('wait-for-consistency', '5s');

// ❌ Avoid - states the obvious
// Sleep for 5 seconds
await step.sleep('wait', '5s');
```

### File Size

**Keep files focused and under 300 lines**
- If a file exceeds 300 lines, consider splitting into multiple files
- Extract reusable logic into separate modules
- Group related functions into service files

### Async/Await

**Always use async/await over .then()**
```typescript
// ✅ Good
const template = await fetchTemplateById(id);

// ❌ Avoid
fetchTemplateById(id).then((template) => { /* ... */ });
```

---

## Checklist for Code Reviews

- [ ] All functions have explicit return types
- [ ] No `any` types (use `unknown` if needed)
- [ ] Error handling is comprehensive
- [ ] Logging includes structured context
- [ ] Database queries use indexes
- [ ] API routes validate input
- [ ] Sensitive data is encrypted
- [ ] Tests cover happy path and error cases
- [ ] Components are small and focused (< 300 lines)
- [ ] Imports are properly organized
- [ ] No secrets in code
- [ ] Rate limiting applied to public endpoints
- [ ] Webhooks verify signatures
- [ ] Analytics events tracked for key actions

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Inngest Documentation](https://www.inngest.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Core Standards](./core-standards.md)
- [Technical Context](../../context/TECHNICAL_CONTEXT.md)
