# Improve FTUX Wizard Completion

Critical analysis of the first-time user experience after signup. Items ordered by effort/impact ratio.

---

## Priority Order

| # | Issue | Effort | Impact |
|---|-------|--------|--------|
| 1 | Persist wizard state to sessionStorage | Low | Critical |
| 2 | Fix resetTemplate on back-nav | Low | Critical |
| 3 | Show "why Next is disabled" per step | Low | High |
| 4 | Default to Gallery + "Recommended" badge | Low | High |
| 5 | Add exit/abandon confirmation guard | Medium | High |
| 6 | Rewrite FTUX welcome screen copy + layout | Medium | High |
| 7 | Rename "Save & Publish" → "Save Template" | Trivial | Medium |
| 8 | Add step subtitles/orientation text | Low | Medium |

---

## Items

### 1. Persist wizard state to sessionStorage
**Effort:** Low | **Impact:** Critical

The Zustand store has no persistence. One browser refresh mid-wizard = all work gone. Users on the PDF extraction path are especially vulnerable — they wait for AI processing, then accidentally navigate away and start from scratch. This silently tanks completion rates.

**Fix:** Use `zustand/middleware` `persist` with `sessionStorage` as the storage adapter.

---

### 2. Fix resetTemplate firing on back-navigation
**Effort:** Low | **Impact:** Critical

`TemplateCreationMethodSelector` calls `resetTemplate()` in a `useEffect` on every mount (`src/components/template/steps/TemplateCreationMethodSelector.tsx:13-16`). If a user is on Step 2 and clicks Back twice, their method choice, uploaded PDF content, and template name are all wiped.

**Fix:** Only call `resetTemplate()` on first mount when there is no existing state — not unconditionally on every mount.

---

### 3. Show "why Next is disabled" per step
**Effort:** Low | **Impact:** High

`isNextDisabled` silently blocks users with a grayed-out button. On the PDF extraction path, the user may be waiting 30s+ for async AI extraction with no visible feedback — the button just stays grayed out. (Gallery path is fine: selecting a card sets `htmlContent` synchronously and unlocks Next immediately.)

**Fix:** On the PDF path, show a loading indicator and a hint like "Processing your PDF…" while extraction is in progress. Once done, surface a success state before the user clicks Next.

---

### 4. Default to Gallery + "Recommended" badge
**Effort:** Low | **Impact:** High

"Extract from PDF" appears first (left card) and is the default mental choice, but it's the hardest path — users need a PDF file ready and must wait for async AI extraction. The Template Gallery path is far lower friction but has no "Recommended" label.

**Fix:** Auto-select `TEMPLATE_GALLERY` as the default creation method so `Next` isn't immediately locked. Add a "Recommended" badge to the gallery card.

---

### 5. Add exit/abandon confirmation guard
**Effort:** Medium | **Impact:** High

Users can freely navigate away mid-wizard (sidebar click, browser Back, close tab) with zero warning. For a 5-step flow involving file uploads and AI processing, this is a significant drop-off vector.

**Fix:** Attach a `beforeunload` event guard and a Next.js `router.beforePopState` guard when `currentStep > 0 && saveStatus !== SUCCESS`. Show a confirmation dialog: "You'll lose your progress if you leave now."

---

### 6. Rewrite FTUX welcome screen copy and layout
**Effort:** Medium | **Impact:** High

The welcome screen (`src/features/dashboard/TemplateTable.tsx:286-296`) is a heading, one line of vague copy, and one button. It does nothing to resolve the "should I bother?" question new users have when they first land.

**Fix:**
- Replace "Your one-stop solution to your dynamic PDF generation needs" with a concrete outcome: *"Turn a PDF into a live API endpoint."*
- Show 3 mini steps: "Pick a method → Customize → Get your API key"
- Add a time estimate: "takes ~2 min"
- Link to live examples

---

### 7. Rename "Save & Publish" → "Save Template"
**Effort:** Trivial | **Impact:** Medium

`completeLabel = 'Save & Publish'` in `src/components/WizardNavigation.tsx:20`. "Publish" implies permanence and going live. First-time users who don't yet understand the dev/prod distinction may hesitate or abandon at the final step.

**Fix:** Change the default `completeLabel` to `'Save Template'`. The dev/prod promotion concept can be introduced after the user has successfully saved their first template.

---

### 8. Add step subtitles/orientation text
**Effort:** Low | **Impact:** Medium

Every step renders its UI cold with no instruction text. Users landing on the Editor step (Step 3) for the first time are confronted with a code/visual editor with no scaffolding or guidance.

**Fix:** Add a 1-line subtitle under each step title in the Wizard header:
- Step 0 (Choose Method): *"How do you want to create your first template?"*
- Step 1 (Source): *"Upload a PDF or choose a gallery template to start with"*
- Step 2 (Details): *"Give your template a name and description"*
- Step 3 (Editor): *"Edit the template to match your data structure"*
- Step 4 (Review): *"Preview your template before saving"*
