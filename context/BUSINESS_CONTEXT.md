# Business Context Document

## 1. Why This System Exists
Templify exists to help software teams generate high-quality PDFs (invoices, contracts, reports, certificates, personalized documents) from dynamic data **without building and maintaining PDF rendering infrastructure**. The product centers on template authoring + an API that turns templates + JSON input into PDFs.

## 2. Business Problem & Impact
Building PDF generation in-house is slow and risky for most teams:
- PDF rendering stacks are brittle and time-consuming to maintain (layout issues, scaling, retries, storage).
- Production reliability matters: failures block customer-facing workflows (billing, documents, compliance).
- Developers want an integration that feels like “call an API, get a PDF,” plus async options for long-running jobs.

Without this system, teams either delay shipping document-heavy features or accept operational debt and reliability risk.

## 3. Users & Stakeholders
- **Primary user/buyer (MVP)**: Individual developers integrating PDF generation into their product.
- **Secondary (future)**: Organizations/teams (billing, shared ownership, negotiated limits).
- **Internal stakeholders**:
  - Product: onboarding, trial conversion, pricing evolution.
  - Sales/Support: manual credit top-ups, escalations (especially for PDF→HTML extraction issues), enterprise discussions.
  - Engineering: reliability, job orchestration, webhook delivery, integrations, observability.

## 4. Value Creation Points
- **Template creation & management**: Enables developers to define how documents look without rebuilding logic.
- **PDF generation API**: Directly powers customers’ “documents shipped” outcomes (revenue-critical for many use cases).
- **Async mode + webhooks**: Enables “PDF ready” pipelines and non-blocking workflows.
- **Onboarding accelerator (PDF→HTML extraction)**: Lowers time-to-first-template by importing existing PDFs into editable templates.

## 5. Core Business Domains
- **Templates**: Authoring, editing, previewing, environment/version separation (dev vs prod).
- **PDF generation**: Synchronous and asynchronous rendering workflows.
- **Credits & usage**: Metered consumption (1 credit = 1 PDF generation) and trial allowance.
- **Developer integrations**: API keys, webhooks, signature validation, documentation.
- **Observability & supportability**: Usage metrics, event logging, delivery tracking, failure paths.

## 6. Critical Business Workflows
- **Signup → trial activation**
  - User creates an account.
  - System provisions API credentials and grants a one-time trial credit allocation.

- **Create template**
  - From scratch, from template gallery, or via PDF→HTML extraction (onboarding accelerator).
  - Template preview generation runs in the background for fast iteration.

- **Promote dev → prod**
  - “Publish to prod” is a safety gate: promote a known-good template before using it in production API calls.
  - Credits/limits apply equally to dev and prod usage.

- **Generate PDF (sync)**
  - Customer calls `POST /convert/{templateId}` and receives a PDF response directly.

- **Generate PDF (async)**
  - Customer calls `POST /convert/{templateId}?runMode=async` (or `Prefer: respond-async`).
  - System triggers a background job and emits webhooks (`pdf.started`, `pdf.generated`, `pdf.failed`) to the customer’s configured endpoint.
  - Async mode is intentionally gated: **a webhook endpoint must be configured**.

- **Manual credit replenishment (MVP)**
  - After trial credits are exhausted, customers contact support/sales to top up credits.

## 7. Business Rules & Constraints
- **Trial credits**
  - **150 credits** are granted as a **one-time trial**.
  - Scope: per user (**Clerk user id**) for now. (Org-level accounting is a future consideration; credits are not scoped per environment.)

- **Metering**
  - **1 credit = 1 PDF generation**.
  - **Charge only on success**: failures do not consume credits.

- **Async mode policy**
  - Async generation requires a configured webhook endpoint (intentional product policy).
  - Webhook delivery is **best-effort** with automatic retries (via job orchestration).

- **Delivery + URLs**
  - Async-generated PDFs are delivered via a URL and are intended to **expire in 24 hours**.
  - Cleanup/retention enforcement is planned to be implemented.

- **Anti-abuse controls (MVP)**
  - API rate limiting exists as an MVP guardrail.
  - Future: raise limits per plan or negotiate for higher tiers.

- **Webhook payload contents**
  - Webhook metadata may include the original input data to support reconciliation/debugging.
  - This may change in the future if data minimization becomes necessary.

## 8. Success Metrics
Suggested business-level metrics to track:
- **Activation**: time-to-first-template, time-to-first-successful PDF generation, % of users who generate a PDF within 24 hours of signup.
- **Reliability**: PDF generation success rate, async job completion rate, p95 render time, webhook delivery success rate.
- **Monetization readiness**: trial-to-top-up conversion rate, credits consumed per active customer, support-assisted replenishment velocity.
- **Retention**: weekly active developers, repeat API usage, webhook adoption for async users.
- **Onboarding accelerator quality**: PDF→HTML extraction success rate and support escalations per 100 uploads.

## 9. Explicit Non-Goals
- **Automated subscription billing (MVP)**: Pricing pages may be aspirational; Stripe subscription flow is not yet integrated.
- **Org-first account model (for now)**: System is built primarily for individual developers, with future preparation for org-level support.
- **Hard delivery guarantees for webhooks**: Current posture is best-effort with retries, not contractual “exactly-once” delivery.
- **Long-term storage guarantees for generated PDFs**: Async URLs are intended to expire; long-term archival is not currently a product promise.

## 10. Assumptions & Open Questions
### Assumptions (confirmed)
- Monetization is currently credit-based with a 150-credit one-time trial; replenishment is manual via support.
- “Charge only on success” is an intentional policy.
- Async generation uses `runMode=async` as the public contract and requires webhooks.
- Async download links are intended to expire in 24 hours; cleanup strategy is forthcoming.
- Webhook payloads include input data for debugging/reconciliation (may be minimized later).
- Webhook delivery is best-effort with retries via orchestration.

### Open questions (to revisit as the product evolves)
- When introducing paid tiers, how will plans map to credits/month, rate limits, and async eligibility?
- What customer-facing tooling will exist for webhook delivery debugging (logs, replay, dead-letter handling)?
- What data minimization/compliance expectations may require changes to webhook payload contents?
