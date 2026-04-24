# SPEC: Streamlined Template Creation Wizard

## 1. Objective

Collapse the 5-step template creation wizard into a 2-step flow (Gallery → Save) with an optional Edit step. The goal is to get a user from intent to a working PDF API in under 90 seconds by eliminating friction at every step.

**Target users:** New users landing in the dashboard for the first time, who want to see the core value (PDF generation) quickly before customising anything.

**Success metric:** Wizard completion rate increases; time-to-first-template decreases.

---

## 2. Current State vs Target State

### Current flow (5 steps, all required)

| Step | Index | Component | Purpose |
|------|-------|-----------|---------|
| Choose Method | 0 | `TemplateCreationMethodSelector` | Pick Gallery vs Extract-from-PDF |
| Select Template | 1 | `TemplateSourceStep` → `TemplateGallery` | Browse gallery |
| Template Details | 2 | `TemplateDetailsStep` | Enter name + description |
| Edit Template | 3 | `TemplateEditorStep` | Code / visual editor |
| Review & Save | 4 | `TemplateReviewStep` | Preview + save |

### Target flow (2 required + 1 optional)

| Step | Index | Component | Purpose |
|------|-------|-----------|---------|
| Select Template | 0 | `TemplateSourceStep` (renamed) | Browse gallery; "Upload PDF" as secondary link |
| Review & Save | 1 | `TemplateReviewStep` | Preview + save |
| _(optional)_ Edit Template | — | `TemplateEditorStep` | Only entered via "Customize" CTA |

---

## 3. Acceptance Criteria

### AC-1: Remove Step 0 (method selection)

- **GIVEN** a user navigates to `/dashboard/create-template`
- **THEN** the gallery is shown immediately (no method selector interstitial)
- **AND** an "Upload PDF instead" secondary link/tab is visible on the gallery page
- **AND** clicking that link switches to the PDF extractor view inline (no step change)
- **AND** `TemplateCreationMethodSelector` component is no longer rendered in the wizard

### AC-2: Auto-populate details from gallery selection

- **GIVEN** a user selects a gallery template
- **THEN** `templateName` and `templateDescription` in the store are set to the template's `title` and `description`
- **AND** the "Template Details" step is skipped entirely — the wizard jumps from gallery selection to Review & Save
- **AND** name + description remain editable inline on the Review & Save step (not in a separate step)

### AC-3: Make the editor opt-in

- **GIVEN** a user has selected a gallery template
- **THEN** the gallery card (or a banner below it) shows a **"Customize (optional)"** button
- **AND** clicking "Customize" opens `TemplateEditorStep` as an intermediate step before Review & Save
- **AND** a **"Use as-is →"** (or "Skip to Save") path is available at all times, bypassing the editor entirely
- **AND** users who skip the editor can still save successfully (existing `handleTemplateSave` logic is unchanged)

### AC-4: Wizard progress bar reflects new step count

- **GIVEN** the gallery-primary flow (no PDF upload)
- **THEN** the `Wizard` component shows exactly 2 steps: "Select Template" and "Review & Save"
- **AND** if the user enters the optional editor, the progress bar shows 3 steps: "Select Template", "Edit Template", "Review & Save"

### AC-5: PDF Upload remains functional

- **GIVEN** a user clicks "Upload PDF instead"
- **THEN** `PDFExtractor` is rendered inline on Step 0, replacing the gallery grid
- **AND** after extraction completes and `htmlContent` is populated, the "Next" button advances to Review & Save
- **AND** `creationMethod` is set to `CreationMethodEnum.EXTRACT_FROM_PDF` in the store

### AC-6: Analytics events preserved

- `wizard_step_viewed` fires on every step transition with correct `step` index and `step_name`
- `wizard_abandoned` fires on unmount when save was not completed and user had advanced past step 0
- `template_created` fires on successful save

### AC-7: Validation gates unchanged

- Review & Save step's "Save" button is disabled while `saveStatus === SaveStatusEnum.SAVING`
- The gallery selection step's "Next" button (or "Use as-is") is disabled when no template is selected (`!htmlContent`)

---

## 4. Component & File Changes

### Files to modify

| File | Change |
|------|--------|
| `src/components/template/CreateTemplateWizard.tsx` | Rewrite step array (2 steps base, 3 with editor opt-in), remove Step 0, wire new navigation logic |
| `src/components/template/TemplateGallery.tsx` | Add "Upload PDF instead" link/tab that triggers inline method switch; add "Customize" and "Use as-is" CTAs per card or as footer actions |
| `src/components/template/steps/TemplateSourceStep.tsx` | Remove dependency on `creationMethod` for routing; accept a `onSwitchToPdf` prop to toggle the inline PDF extractor |
| `src/components/template/steps/TemplateReviewStep.tsx` | Add inline editable name + description fields (replaces the separate `TemplateDetailsStep`) |
| `src/components/WizardNavigation.tsx` | Support dynamic `totalSteps` and a "Use as-is" skip action alongside "Next" |

### Files to remove / retire

| File | Action |
|------|--------|
| `src/components/template/steps/TemplateCreationMethodSelector.tsx` | Remove from wizard render; keep file if used elsewhere, otherwise delete |
| `src/components/template/steps/TemplateDetailsStep.tsx` | Remove from wizard render; fields merged into `TemplateReviewStep` |

### Store changes (`TemplateStore.ts`)

- Add `isEditorOptedIn: boolean` flag — set to `true` when user clicks "Customize"
- Update `resetTemplate` to reset `isEditorOptedIn: false`
- Default `creationMethod` to `CreationMethodEnum.TEMPLATE_GALLERY` (currently defaults to `EXTRACT_FROM_PDF`)

---

## 5. New Wizard Step Logic

```
currentStep=0  →  TemplateSourceStep (gallery as default, PDF upload inline toggle)
  ↓ user selects a template
  ↓ "Use as-is" → skip editor → currentStep=1
  ↓ "Customize"  → set isEditorOptedIn=true → currentStep=1 (editor)

IF isEditorOptedIn:
  currentStep=1  →  TemplateEditorStep
    ↓ "Next" → currentStep=2

  currentStep=2  →  TemplateReviewStep (with inline name/description)
    ↓ "Save" → handleTemplateSave()

ELSE:
  currentStep=1  →  TemplateReviewStep (with inline name/description)
    ↓ "Save" → handleTemplateSave()
```

**`isNextDisabled` guards:**
- Step 0: `!htmlContent` (no template selected / PDF not yet extracted)
- Step 1 (editor, if opted-in): `!htmlContent`
- Step 1/2 (review): `!templateName || !templateDescription || saveStatus === SaveStatusEnum.SAVING`

---

## 6. UI Spec

### Gallery page additions

1. **"Upload PDF instead"** — small muted link below the search bar, right-aligned. On click: replaces gallery grid with `PDFExtractor`, sets `creationMethod = EXTRACT_FROM_PDF`. A "← Back to gallery" link returns the user to the gallery.

2. **Per-card CTAs** — each gallery card footer shows two buttons:
   - **"Use as-is"** (primary outline, full width) — selects template, sets `creationMethod = TEMPLATE_GALLERY`, navigates to Review & Save directly
   - **"Customize"** (ghost/secondary) — selects template, sets `isEditorOptedIn = true`, navigates to editor step

3. Currently the gallery card already has a single "Use Template" / "Selected" toggle button. Replace it with the two-button layout described above. Remove the "Selected" indicator from the card since selection is now implicit in the CTA click.

### Review & Save — inline details editing

Add a compact `Details` section at the top of `TemplateReviewStep` with:
- `Input` for template name (pre-populated from store)
- `Textarea` for description (pre-populated from store)

These replace the removed `TemplateDetailsStep`. Validation: both must be non-empty before the Save button activates.

---

## 7. Tech Stack & Constraints

- **Framework:** Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui
- **State:** Zustand (`TemplateStore`) — no new state libraries
- **Routing:** No URL param changes; wizard is entirely client-side step state
- **No backend changes** — `UpsertTemplate`, `PublishTemplateToProd`, and all server actions are unchanged
- **i18n:** Any new user-facing strings must be added to `src/locales/en.json` and `src/locales/fr.json`

---

## 8. Testing Strategy

### Unit tests (Vitest, co-located `*.test.tsx`)

- `CreateTemplateWizard` — renders gallery at step 0; "Use as-is" skips to review step; "Customize" enters editor step; step count in `Wizard` component matches `isEditorOptedIn` state
- `TemplateGallery` — "Use as-is" button triggers store population + step advance; "Upload PDF instead" link switches to PDF extractor view
- `TemplateReviewStep` — inline name/description fields are pre-populated; Save button disabled when fields empty; Save button disabled during `SAVING` state

### Integration tests (`vitest.integration.config.ts`)

- Full gallery → review → save flow without editor
- Full gallery → editor → review → save flow with editor
- PDF upload → review → save flow

### E2E tests (Playwright `*.spec.ts`)

- New user completes gallery → save in < 5 clicks
- "Customize" path: gallery → editor → save
- PDF upload path remains reachable and functional

---

## 9. Out of Scope

- Template preview in gallery cards (thumbnail images) — separate initiative
- Success page changes — no modifications
- Any changes to the post-save flow (`/dashboard/template/success`)
- Multi-template selection or bulk operations
- A/B testing the new vs old wizard — can be added later

---

## 10. Resolved Decisions

1. **Inline Details validation** — show error on blur (not on Save attempt).
2. **"Upload PDF instead"** — plain text link (not a styled Tab component).
3. **`TemplateCreationMethodSelector`** — delete the file.
