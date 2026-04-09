# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start dev server (Next.js + Spotlight sidecar)
npm run build            # Production build
npm run lint             # ESLint
npm run check-types      # TypeScript type check (tsc --noEmit)
npm run test             # Unit tests (Vitest)
npm run test -- path/to/file  # Run single test file
npm run test:integration # Integration tests
npm run test:all         # Unit + integration tests
npm run test:e2e         # Playwright E2E tests
npm run db:generate      # Generate Drizzle migration after schema changes
npm run db:migrate       # Apply migrations (production env)
npm run db:migrate:test  # Apply migrations (test env)
npm run db:studio        # Open Drizzle Studio (DB browser)
npm run commit           # Commitizen (use instead of git commit - commitlint is enforced)
```

**Node.js 22.6 required.**

## Architecture

This is the **dashboard** service of Templify. It orchestrates templates, background jobs, credits, and delivery — but does *not* render PDFs or extract HTML. Those are delegated to separate services:

- **`job-runner/`** — Express/Puppeteer service. Dashboard calls `JOB_RUNNER_BASE_URL/generate-pdf` with bearer token.
- **`pdf2llm2html/`** — FastAPI/OpenAI service. Dashboard calls `PDF_TO_HTML_BASE_URL/convert` with bearer token.

### Key Paths

| Path | Purpose |
|------|---------|
| `src/app/[locale]/convert/[templateId]/route.ts` | Public PDF generation API (sync + async) |
| `src/app/[locale]/api/inngest/route.ts` | Inngest background job endpoint |
| `src/app/[locale]/api/webhook/clerk/route.ts` | Clerk webhook — creates user, generates API key, grants 150 trial credits |
| `src/app/[locale]/api/authenticateApi.ts` | Shared API auth middleware (client_id + client_secret headers) |
| `src/app/[locale]/(auth)/dashboard/` | Clerk-authenticated dashboard pages |
| `src/models/Schema.ts` | Drizzle ORM schema (all tables) |
| `src/libs/DB.ts` | Neon serverless Postgres connection |
| `src/inngest/` | Background job definitions |
| `src/libs/analytics/posthog-server.ts` | PostHog server-side event tracking |
| `src/service/crypto.ts` | AES encrypt/decrypt for API keys and webhook secrets |

### Request Flows

**Sync PDF generation** (`POST /convert/{templateId}`):
1. Authenticate via `client_id` / `client_secret` headers
2. Rate limit: 4 req / 60s per user (Upstash Redis sliding window)
3. Load template by `(templateId, environment)` — `dev` by default unless `devMode=false`
4. Compile Handlebars template with `templateData`
5. Call `job-runner /generate-pdf` → receive PDF bytes
6. Deduct 1 credit from `users.remainingBalance`
7. Record in `generated_templates`, return PDF

**Async PDF generation** (add `runMode=async` or `Prefer: respond-async` header):
- Requires a configured webhook endpoint (enforced before emitting Inngest event)
- Returns 202 immediately; Inngest sends `pdf.started` → generates PDF → uploads to Vercel Blob → sends `pdf.generated` with `download_url`

**Template preview** (background): On template save, `template/generate-preview` Inngest event triggers PDF generation and uploads to Vercel Blob, updating `templates.previewURL`.

**PDF→HTML extraction** (onboarding): Upload PDF to Blob → emit `upload/extract.html` → Inngest calls `pdf2llm2html /convert` → returns extracted HTML.

### Data Model

Templates have **dev/prod environments as separate DB rows** keyed by `(templateId, environment)`. Promotion copies dev → prod via upsert — there is no branch-based versioning.

Key tables: `users`, `apikeys`, `templates`, `generated_templates`, `credit_transactions`, `webhook_endpoints`, `webhook_events`, `webhook_deliveries`.

### TypeScript Patterns

- Use `type` over `interface` (ESLint enforced)
- Always define explicit return types on functions
- Use `unknown` instead of `any`; use discriminated unions for complex state
- Avoid non-null assertions (`!`) — handle nulls explicitly
- Prefer `readonly` for immutable data structures

### API Route Pattern

```typescript
export async function POST(req: NextRequest): Promise<NextResponse> {
  const authResult = await authenticateApi(req);
  if (authResult instanceof NextResponse) {
    return authResult;
  } // auth error

  // validate → business logic → return NextResponse.json({ data: ... })
}
```

Error responses: `{ error: string; code?: string }`. Success responses: `{ data: T; meta?: object }`.

### Inngest Pattern

- One function per event type, in `src/inngest/functions/`
- Use `step.run()` for retriable units of work — **throw errors** to trigger retries (don't swallow them)
- Use `step.sendEvent()` for chaining events; `step.sleep()` for delays (never `setTimeout`)

### Observability

- **Sentry**: `captureException` with tags/extra context; always re-throw after capturing
- **PostHog** (`posthog-server.ts`): track key events — `pdf_generated`, `pdf_generation_failed`, feature usage, API success/failure
- **Logger** (`src/libs/Logger.ts`): structured Pino logger — use `logger.info/warn/error`, never `console.log` in production code

### Security

- API keys and webhook secrets are AES-encrypted at rest (`src/service/crypto.ts`) using `ENCRYPTION_KEY`
- Webhook payloads signed with HMAC-SHA256 (`x-templify-signature` header)
- Environment variables validated at startup via `@t3-oss/env-nextjs` (`src/libs/Env.ts`)
- Never use raw SQL with user input — Drizzle's query builder prevents injection

### Testing

- Unit tests: Vitest, files named `*.test.ts(x)`, co-located with source
- Integration tests: separate Vitest config (`vitest.integration.config.ts`)
- E2E tests: Playwright, files named `*.spec.ts`
- Max 3 assertions per test; Arrange–Act–Assert structure

### Commits

Use `npm run commit` (commitizen). Conventional Commits format is enforced via commitlint + husky. Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`.
