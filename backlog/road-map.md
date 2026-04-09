# Templify — Pre-Auth Workflows Roadmap

> **Goal:** Move the aha moment (edit template → see real PDF) *before* the signup wall to improve signup rates, template creation, and usage rates.

---

## Problem Statement

Templify's core value proposition is: *try a template → generate a PDF → integrate via API.* Currently **every meaningful interaction is behind a signup wall** — users must create an account before touching the editor, browsing the gallery, or generating even a demo PDF.

This is the primary conversion killer: prospects can't experience the aha moment before being asked to commit with an account.

---

## Current State vs. Target State

| Feature | Today | Target |
|---|---|---|
| Template Gallery browse | Auth required | **Public** |
| HTML Builder (GrapesJS) demo | Auth required | **Public sandbox** |
| Handlebars Editor demo | Auth required | **Public sandbox** |
| Generate sample PDF | Auth required | **Anonymous 1-click (watermarked)** |
| Template preview images | Auth required | **Public lightbox** |
| Save templates | Auth required | Auth required (correct) |
| API credentials & webhooks | Auth required | Auth required (correct) |
| Usage metrics & billing | Auth required | Auth required (correct) |

---

## Recommended Funnel Redesign

```
Landing Page
    │
    ├─ Hero: "Try it live" ──────────────────→ /try (Playground sandbox)
    │                                               │
    │                                               └─ "Save & Deploy" → inline signup modal
    │                                                                          │
    ├─ Hero: "Generate PDF" → watermarked demo PDF  └─→ Dashboard (template pre-loaded)
    │         download → signup modal
    │
    └─ "Browse Templates" → Public /gallery
              │
              └─ "Use this template" → inline signup → Dashboard (template pre-selected)
```

---

## Phase 1 — Quick Wins (1–2 days)

### 1.1 Public Template Gallery

**Impact: HIGH | Effort: LOW**

Make the template gallery browsable without login. Users can browse, filter, search, and preview templates anonymously.

**User flow:**
1. User visits `/gallery` (or `/dashboard/template-gallery`)
2. Browses pre-built templates, sees preview images in a lightbox
3. Clicks "Use this template"
4. Inline signup modal appears — on completion, template is pre-selected in the creation wizard

**Why this matters:** Turns a locked feature into a marketing asset. A prospect who can browse 20 invoice templates is far more likely to sign up than one staring at a login screen.

**Files to modify:**
- `src/middleware.ts` — remove auth guard from `/gallery` route
- `src/components/template/steps/GalleryStep.tsx` — expose publicly, add unauthenticated CTA
- `src/features/dashboard/` — extract gallery component for public use

---

### 1.2 Preview Images in Public Lightbox

**Impact: MEDIUM | Effort: LOW**

`template_gallery` rows already store `previewURL`. Expose these publicly in a full-page lightbox on each gallery card. No login needed to *see* what a template produces — only to *use* it.

**Files to modify:**
- `src/components/template/steps/GalleryStep.tsx`

---

### 1.3 Inline Signup Modal (Replace Page Redirect)

**Impact: HIGH | Effort: LOW-MEDIUM**

Every "Start free trial" CTA currently does a hard redirect to `/sign-in`, breaking the user's flow context. Replace with a Clerk inline modal triggered in-place.

**Trigger points:**
- "Use this template" in gallery
- "Save & Deploy" in playground
- "Generate PDF" on landing page demo

**State preservation:** Save draft template selection / playground state to `sessionStorage` before showing the modal. Replay it post-auth so the user continues where they left off — not a blank dashboard.

**Files to modify:**
- `src/features/landing/Navbar.tsx`
- `src/features/landing/Hero.tsx`
- New: `src/hooks/useInlineSignup.ts`

---

## Phase 2 — Core: The Playground (3–5 days)

### 2.1 `/try` — Public Handlebars Editor Sandbox

**Impact: VERY HIGH | Effort: MEDIUM**

This is the single highest-leverage investment. Create a fully public `/try` route with a working Handlebars editor sandbox pre-loaded with a sample template (e.g., invoice) and sample JSON data.

**User flow:**
1. User lands on `/try` via landing page CTA or direct link
2. Handlebars editor opens with a working invoice template + live preview panel
3. User edits template code, changes sample JSON, sees PDF preview update in real-time
4. Clicks "Save & Deploy"
5. Inline signup modal appears in context
6. On signup: draft template state is auto-saved to their new account
7. User arrives at dashboard with their template ready — not a blank slate

**Why this works:** The user experiences the complete core value loop (edit → preview → "that's my PDF") in under 60 seconds, *before* being asked for anything. Friction moves to *after* the aha moment.

**Files to create/modify:**
- New: `src/app/[locale]/try/page.tsx` — public route (no Clerk middleware guard)
- New: `src/app/[locale]/try/[templateSlug]/page.tsx` — try a specific gallery template
- Reuse: `src/components/template/handlebars-editor/` — strip save/API credential actions, add "Sign up to save" CTA overlay

---

### 2.2 Unauthenticated Preview PDF Endpoint

**Impact: HIGH | Effort: MEDIUM**

New public API endpoint powering the playground's "Generate PDF" button and the landing page demo.

```
POST /api/preview-pdf
Body: { template: string, sampleData: object }
Response: PDF binary (watermarked)
```

**Security constraints:**
- Rate limited by IP (e.g., 3 requests/minute via Upstash Redis)
- Watermark injected by job-runner ("Generated with Templify — Sign up free to remove")
- No credits deducted (system-owned budget for demos)
- Template size capped to prevent abuse

**Files to create:**
- New: `src/app/[locale]/api/preview-pdf/route.ts`

---

## Phase 3 — Polish (2–3 days)

### 3.1 Landing Page Hero — One-Click Demo PDF

**Impact: HIGH | Effort: LOW-MEDIUM**

Add a "Generate PDF" button to the hero section. Pre-select a system demo template (invoice). User clicks → watermarked PDF downloads instantly, zero signup required.

Immediately after download: modal appears — *"Like this? Sign up free for 150 credits — no watermark, full editor."*

**Files to modify:**
- `src/features/landing/Hero.tsx`
- New: `src/app/[locale]/api/demo-pdf/route.ts` (thin wrapper around preview-pdf for the hero demo)

---

### 3.2 PostHog Funnel Events

Add analytics events on all new pre-auth touchpoints to measure the impact.

| Event | Trigger |
|---|---|
| `playground_visited` | User lands on `/try` |
| `playground_edited` | User modifies the template or sample data |
| `playground_pdf_generated` | User clicks "Generate PDF" in playground |
| `playground_signup_triggered` | User clicks "Save & Deploy" |
| `gallery_visited_unauthenticated` | Unauthenticated user visits gallery |
| `gallery_preview_opened` | Lightbox opened on a gallery card |
| `gallery_cta_clicked` | "Use this template" clicked without auth |
| `demo_pdf_generated` | Landing hero PDF generated |
| `demo_signup_triggered` | Signup modal opened from demo PDF |

---

## Success Metrics & Targets

| Metric | PostHog Event | Target |
|---|---|---|
| Playground → Signup conversion | `playground_signup_triggered` / `playground_visited` | > 20% |
| Gallery → Signup conversion | `gallery_cta_clicked` / `gallery_visited_unauthenticated` | > 15% |
| Demo PDF → Signup conversion | `demo_signup_triggered` / `demo_pdf_generated` | > 25% |
| Time-to-first-template-created | `template_created` (time from account creation) | Reduce 50% |

---

## Critical Files Index

| File | Change |
|---|---|
| `src/middleware.ts` | Remove auth guard from `/gallery`, `/try` routes |
| `src/app/[locale]/(unauth)/page.tsx` | Add playground CTA + hero demo PDF button |
| `src/features/landing/Navbar.tsx` | Inline Clerk modal (replace `/sign-in` redirect) |
| `src/features/landing/Hero.tsx` | Demo PDF button |
| `src/components/template/steps/GalleryStep.tsx` | Public-safe, unauthenticated CTA |
| `src/components/template/handlebars-editor/` | Sandbox mode (strip save/credential actions) |
| `src/hooks/useInlineSignup.ts` | New — inline Clerk modal + sessionStorage state replay |
| `src/app/[locale]/try/page.tsx` | New — public playground route |
| `src/app/[locale]/api/preview-pdf/route.ts` | New — unauthenticated, watermarked, IP rate-limited |
| `src/app/[locale]/api/demo-pdf/route.ts` | New — thin demo wrapper for landing hero |

---

## Acceptance Criteria

- [ ] `/gallery` accessible without login — templates visible, preview lightbox opens on card click
- [ ] `/try` loads Handlebars editor with sample template + live preview — no login required
- [ ] "Generate PDF" in playground returns a watermarked PDF
- [ ] "Save & Deploy" in playground shows inline signup modal without page navigation
- [ ] Post-signup: user lands on dashboard with their playground template pre-loaded (not blank)
- [ ] Landing hero "Generate PDF" downloads watermarked PDF, modal appears after
- [ ] All new PostHog events firing in production
- [ ] IP rate limiting on `/api/preview-pdf` confirmed working (3 req/min)
- [ ] No existing authenticated flows broken
