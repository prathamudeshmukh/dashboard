# Implementation Plan: Streamlined Template Creation Wizard

## Overview

Collapse the 5-step wizard into 2 required steps (Gallery → Review & Save) with an
optional Edit step. See `SPEC.md` for full acceptance criteria.

---

## Dependency Graph

```
TemplateStore.ts            ← no dependencies; all components read from it
      │
      ├── TemplateGallery.tsx   ← reads store; needs onUseAsIs / onCustomize callbacks
      │         │
      │         └── TemplateSourceStep.tsx  ← thin wrapper; passes callbacks down; owns
      │                                        inline PDF toggle state
      │
      ├── TemplateReviewStep.tsx  ← reads store; adds inline name/description fields
      │
      └── CreateTemplateWizard.tsx  ← orchestrates all of the above;
                                       owns isEditorOptedIn local state;
                                       owns currentStep state
```

**Key design decision:** `isEditorOptedIn` is local state in `CreateTemplateWizard`, not in
the Zustand store. Only the wizard's rendering logic needs it; persisting it globally would
leak wizard-navigation concerns into the store.

---

## Architecture Notes

### Step index scheme

| `isEditorOptedIn` | step 0 | step 1 | step 2 |
|-------------------|--------|--------|--------|
| `false` | Gallery | Review & Save | — |
| `true` | Gallery | Edit Template | Review & Save |

`renderStep` switches on `currentStep + isEditorOptedIn`.
`isNextDisabled` mirrors the same matrix.

### "Use as-is" path
Gallery card CTA → `onUseAsIs()` → `setCurrentStep(1)` (always lands on Review because
`isEditorOptedIn` is still `false`).

### "Customize" path
Gallery card CTA → `onCustomize()` → `setIsEditorOptedIn(true)` then `setCurrentStep(1)`
(now step 1 = Editor; Review is step 2).

### Back navigation edge case
When the user presses Back from Editor (step 1) to Gallery (step 0), reset
`isEditorOptedIn` to `false` so the step count collapses back to 2. The gallery
selection state (htmlContent, templateName, etc.) remains in the store — only the
editor opt-in flag is reset.

### Inline PDF upload toggle
Owned as local state `showPdfUpload: boolean` inside `TemplateSourceStep`. Toggling does
**not** change `currentStep`. `creationMethod` in the store is set to
`EXTRACT_FROM_PDF` when the user switches and back to `TEMPLATE_GALLERY` when they
return to the gallery.

---

## Phase 1 — Store Foundation

### Task 1: Fix `TemplateStore` defaults and `resetTemplate`

**File:** `src/libs/store/TemplateStore.ts`

**Changes:**
- Change `creationMethod` initial value from `EXTRACT_FROM_PDF` → `TEMPLATE_GALLERY`
- Add `creationMethod: CreationMethodEnum.TEMPLATE_GALLERY` to `resetTemplate`

**Why:** The store currently defaults to `EXTRACT_FROM_PDF`. With gallery as the primary
path, this default must flip. Without the reset fix, a user who abandons mid-flow and
restarts would carry stale state.

**Acceptance criteria:**
- [ ] `useTemplateStore.getState().creationMethod` is `TEMPLATE_GALLERY` on init
- [ ] After `resetTemplate()`, `creationMethod` is `TEMPLATE_GALLERY`

**Verification:**
- [ ] `npm run check-types` passes
- [ ] Unit test: call `resetTemplate`, assert `creationMethod === TEMPLATE_GALLERY`

**Estimated scope:** XS (2 lines changed)

---

### Checkpoint A

- [ ] `npm run check-types` passes
- [ ] `npm test` passes (no regressions in existing store tests)

---

## Phase 2 — Gallery Two-CTA Layout

### Task 2: Replace single "Use Template" button with "Use as-is" + "Customize" CTAs

**File:** `src/components/template/TemplateGallery.tsx`

**Changes:**
- Accept two new callback props: `onUseAsIs: (template: TemplateGalleryProps) => void`
  and `onCustomize: (template: TemplateGalleryProps) => void`
- Each card footer: replace the single "Use Template" / "Selected" toggle with two
  buttons side by side:
  - **"Use as-is"** (full-width outline button) — calls `handleTemplateSelect(template)`
    then `onUseAsIs(template)`
  - **"Customize"** (ghost/secondary button) — calls `handleTemplateSelect(template)` then
    `onCustomize(template)`
- Remove the `selectedTemplate === template.id ? 'Selected' : 'Use Template'` toggle
  logic from the button label (selection is now implicit in the CTA action)
- Keep search, filter, and loading skeleton unchanged
- Keep `handleTemplateSelect` (store population) unchanged

**Acceptance criteria:**
- [ ] Each card shows two buttons: "Use as-is" and "Customize"
- [ ] Clicking "Use as-is" populates the store (templateName, htmlContent, etc.) and
  calls `onUseAsIs`
- [ ] Clicking "Customize" populates the store and calls `onCustomize`
- [ ] No card selection ring remains after click (ring was tied to `selectedTemplate` — the
  new behaviour skips straight to the callback)

**Verification:**
- [ ] `npm run check-types` passes
- [ ] Unit test: render gallery with mock callbacks; click "Use as-is" on first card;
  assert `onUseAsIs` called with correct template; assert store populated
- [ ] Unit test: click "Customize"; assert `onCustomize` called

**Estimated scope:** S (replace ~20 lines in CardFooter)

---

## Phase 3 — TemplateSourceStep inline PDF toggle

### Task 3: Add "Upload PDF instead" link and inline PDF extractor toggle

**File:** `src/components/template/steps/TemplateSourceStep.tsx`

**Changes:**
- Accept `onUseAsIs: () => void` and `onCustomize: () => void` props (passed through to
  `TemplateGallery`)
- Add `showPdfUpload: boolean` local state, default `false`
- When `showPdfUpload === false`: render `<TemplateGallery onUseAsIs={...} onCustomize={...} />`
  plus a plain text link **"Upload PDF instead"** below the gallery controls (or above,
  matching the design system's muted link style)
- When `showPdfUpload === true`: render `<PDFExtractor />` plus a plain text link
  **"← Back to gallery"**
- On switch to PDF view: call `setCreationMethod(EXTRACT_FROM_PDF)` from store
- On switch back to gallery: call `setCreationMethod(TEMPLATE_GALLERY)` from store

**Note:** `onUseAsIs` / `onCustomize` are only relevant for the gallery path. When the
user is in PDF upload mode, they advance via the normal "Next" button in
`WizardNavigation` once extraction completes (`!htmlContent` guard).

**Acceptance criteria:**
- [ ] Gallery is shown by default (no PDF extractor on first render)
- [ ] "Upload PDF instead" link is visible below the gallery
- [ ] Clicking it shows `PDFExtractor` and hides gallery; `creationMethod` becomes
  `EXTRACT_FROM_PDF`
- [ ] "← Back to gallery" link returns to gallery view; `creationMethod` becomes
  `TEMPLATE_GALLERY`
- [ ] `onUseAsIs` / `onCustomize` are passed to `TemplateGallery` unchanged

**Verification:**
- [ ] `npm run check-types` passes
- [ ] Unit test: renders gallery by default; click "Upload PDF instead" → PDFExtractor
  visible, link changes to "← Back to gallery"; click back → gallery visible

**Estimated scope:** S (replace ~10 lines + add ~20)

---

### Checkpoint B

- [ ] `npm run check-types` passes
- [ ] `npm test` passes (Tasks 1–3 unit tests)
- [ ] `TemplateGallery` renders correctly with two CTAs per card
- [ ] PDF toggle works without touching wizard step state

---

## Phase 4 — Inline Details on Review Step

### Task 4: Add inline name/description fields to `TemplateReviewStep`

**File:** `src/components/template/steps/TemplateReviewStep.tsx`

**Changes:**
- At the top of the "Details" card, add:
  - `Input` for `templateName` (pre-populated from store via `setTemplateName` on change)
  - `Textarea` for `templateDescription` (pre-populated via `setTemplateDescription`)
- On **blur**: validate that the field is non-empty; if empty, show an inline error message
  below the field (e.g., "Name is required")
- Error state: use a `useState<{ name: boolean; description: boolean }>` local to this
  component; set to `true` on blur when empty, reset to `false` on change when non-empty
- The existing read-only `<p>` elements displaying name and description are replaced by
  these inputs (don't render both)
- The rest of the step (preview iframe, JSON card) is unchanged

**Acceptance criteria:**
- [ ] Name and description inputs are pre-populated when user arrives from gallery
  selection
- [ ] Editing the inputs updates the store in real time (no save button needed in this
  step)
- [ ] Blurring an empty name input shows "Name is required" error beneath it
- [ ] Blurring an empty description input shows "Description is required" error
- [ ] Error clears as soon as the user types into the field
- [ ] Save button in `WizardNavigation` remains disabled while either field is empty
  (enforced by `isNextDisabled` in wizard, not in this component)

**Verification:**
- [ ] `npm run check-types` passes
- [ ] Unit test: render with empty store values; blur name input; assert error message
  visible; type into input; assert error clears
- [ ] Unit test: render with pre-populated values; assert inputs show correct values

**Estimated scope:** S (add ~40 lines, remove ~10)

---

### Checkpoint C

- [ ] `npm run check-types` passes
- [ ] `npm test` passes (Task 4 unit tests)

---

## Phase 5 — Wizard Orchestration

### Task 5: Rewrite `CreateTemplateWizard` step logic

**File:** `src/components/template/CreateTemplateWizard.tsx`

**Changes:**

1. **Remove** import of `TemplateCreationMethodSelector` and `TemplateDetailsStep`

2. **Add** local state: `const [isEditorOptedIn, setIsEditorOptedIn] = useState(false)`

3. **Rewrite `steps` array:**
   ```typescript
   const steps = isEditorOptedIn
     ? [
         { id: 'source', title: 'Select Template' },
         { id: 'editor', title: 'Edit Template' },
         { id: 'review', title: 'Review & Save' },
       ]
     : [
         { id: 'source', title: 'Select Template' },
         { id: 'review', title: 'Review & Save' },
       ];
   ```

4. **Rewrite `renderStep`:**
   ```
   case 0 → <TemplateSourceStep onUseAsIs={handleUseAsIs} onCustomize={handleCustomize} />
   case 1 → isEditorOptedIn ? <TemplateEditorStep /> : <TemplateReviewStep />
   case 2 → <TemplateReviewStep /> (only reachable when isEditorOptedIn)
   ```

5. **Add handlers:**
   ```typescript
   const handleUseAsIs = () => setCurrentStep(1);
   const handleCustomize = () => {
     setIsEditorOptedIn(true);
     setCurrentStep(1);
   };
   ```

6. **Rewrite `handlePrevious`:**
   - When going from step 1 back to step 0 and `isEditorOptedIn === true`: also reset
     `setIsEditorOptedIn(false)` so the step count collapses back to 2
   - Otherwise: standard `setCurrentStep(prev => prev - 1)`

7. **Rewrite `isNextDisabled`:**
   ```
   step 0: !htmlContent
   step 1, isEditorOptedIn: !htmlContent
   step 1/2 (review): !templateName || !templateDescription || saveStatus === SAVING
   ```

8. **Update `resetTemplate` call in the cleanup `useEffect`** to clear `isEditorOptedIn`
   (already handled because it's local state, not store state — resetting component via
   unmount is sufficient)

9. **Update analytics:** `wizard_abandoned` ref still captures correct step name via the
   updated `steps` array

10. **Update `Wizard` progress bar call:** pass `steps` directly (already dynamic)

**Acceptance criteria:**
- [ ] Navigating to `/dashboard/create-template` shows the gallery immediately (no method
  selector)
- [ ] "Use as-is" on a gallery card → jumps to Review & Save (2-step progress bar)
- [ ] "Customize" on a gallery card → goes to Edit Template (3-step progress bar)
- [ ] Back from Edit Template to Gallery resets to 2-step progress bar
- [ ] PDF upload path: toggle → extract → Next → Review & Save (2-step bar)
- [ ] `wizard_step_viewed` fires with correct step name at each transition
- [ ] `wizard_abandoned` fires if user leaves without saving after step 0

**Verification:**
- [ ] `npm run check-types` passes
- [ ] Unit test: render wizard; assert step 0 shows `TemplateSourceStep` (not method
  selector)
- [ ] Unit test: simulate "Use as-is" → assert `currentStep` becomes 1, `isEditorOptedIn`
  false, `renderStep` returns `TemplateReviewStep`
- [ ] Unit test: simulate "Customize" → assert `currentStep` becomes 1, `isEditorOptedIn`
  true, `renderStep` returns `TemplateEditorStep`
- [ ] Unit test: Back from editor → assert `isEditorOptedIn` reset to false

**Estimated scope:** M (rewrite ~60 lines; net reduction)

---

### Checkpoint D

- [ ] `npm run check-types` passes
- [ ] `npm test` passes (all Tasks 1–5 unit tests)
- [ ] Manual: gallery → "Use as-is" → review (2-step bar) → save → success page ✓
- [ ] Manual: gallery → "Customize" → editor → review (3-step bar) → save → success ✓
- [ ] Manual: gallery → "Upload PDF instead" → extract → review → save → success ✓

---

## Phase 6 — Cleanup & i18n

### Task 6: Delete `TemplateCreationMethodSelector`, verify `TemplateDetailsStep` orphaned

**Files:**
- DELETE `src/components/template/steps/TemplateCreationMethodSelector.tsx`
- Verify `TemplateDetailsStep.tsx` has no remaining imports in the codebase (keep file,
  do not delete — it's not explicitly in scope)

**Acceptance criteria:**
- [ ] `TemplateCreationMethodSelector.tsx` is deleted
- [ ] `grep -r "TemplateCreationMethodSelector"` returns 0 results
- [ ] `npm run build` passes (no dangling imports)

**Verification:**
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

**Estimated scope:** XS

---

### Task 7: Add i18n strings for new UI text

**Files:** `src/locales/en.json`, `src/locales/fr.json`

**New strings needed:**
- `"uploadPdfInstead"`: `"Upload PDF instead"` / `"Uploader un PDF à la place"`
- `"backToGallery"`: `"← Back to gallery"` / `"← Retour à la galerie"`
- `"useAsIs"`: `"Use as-is"` / `"Utiliser tel quel"`
- `"customize"`: `"Customize"` / `"Personnaliser"`
- `"nameRequired"`: `"Name is required"` / `"Le nom est requis"`
- `"descriptionRequired"`: `"Description is required"` / `"La description est requise"`

**Note:** If the codebase uses hardcoded English strings in components (common in this
codebase — verify before adding keys), adding to locales may be premature. Check the
pattern in `TemplateGallery.tsx` first. If strings are hardcoded there, follow the same
pattern for consistency.

**Acceptance criteria:**
- [ ] All new user-facing strings follow the same i18n pattern as adjacent components
- [ ] French translations provided for all new keys

**Estimated scope:** XS

---

### Final Checkpoint

- [ ] `npm run check-types` passes
- [ ] `npm test` passes (80%+ coverage on modified files)
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Manual golden paths (all three flows) verified end-to-end

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `isEditorOptedIn` local state vs store: Back nav could get out of sync | Med | Always reset `isEditorOptedIn` in `handlePrevious` when returning to step 0 |
| Gallery card with two buttons may break narrow-screen layout | Low | Use `flex-col sm:flex-row` layout; test at 375px |
| `resetTemplate` default change breaks PDF upload flow | Low | PDF upload sets `creationMethod` to `EXTRACT_FROM_PDF` explicitly on toggle — default is irrelevant once running |
| Existing unit tests for `TemplateCreationMethodSelector` (none found) | None | No tests exist for this component |
| `TemplateDetailsStep` still imported somewhere | Low | Task 6 includes `grep` verification |

---

## Task Execution Order

```
Task 1 (Store)
    ↓
Task 2 (Gallery CTAs) ←→ Task 4 (Review inline details)  [can run in parallel]
    ↓
Task 3 (SourceStep toggle)
    ↓
Task 5 (Wizard orchestration)
    ↓
Task 6 (Cleanup) ←→ Task 7 (i18n)  [can run in parallel]
```
