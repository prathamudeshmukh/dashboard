# Todo: Streamlined Template Creation Wizard

## Phase 1 — Store Foundation

- [ ] **Task 1** — `TemplateStore.ts`: fix `creationMethod` default → `TEMPLATE_GALLERY`; add to `resetTemplate`
- [ ] **Checkpoint A**: `npm run check-types` + `npm test` green

## Phase 2 — Gallery CTAs

- [ ] **Task 2** — `TemplateGallery.tsx`: replace single CTA with "Use as-is" + "Customize" buttons; accept `onUseAsIs`/`onCustomize` props

## Phase 3 — Inline PDF Toggle

- [ ] **Task 3** — `TemplateSourceStep.tsx`: add "Upload PDF instead" plain text link; toggle `PDFExtractor` inline; pass callbacks to gallery
- [ ] **Checkpoint B**: `npm run check-types` + `npm test` green; gallery two-CTA layout working

## Phase 4 — Review Inline Details

- [ ] **Task 4** — `TemplateReviewStep.tsx`: add inline name/description inputs; on-blur validation; pre-populated from store
- [ ] **Checkpoint C**: `npm run check-types` + `npm test` green

## Phase 5 — Wizard Orchestration

- [ ] **Task 5** — `CreateTemplateWizard.tsx`: remove Step 0; add `isEditorOptedIn` local state; rewrite step array, renderStep, isNextDisabled, handlePrevious; wire onUseAsIs/onCustomize handlers
- [ ] **Checkpoint D**: all three manual golden paths verified end-to-end

## Phase 6 — Cleanup & i18n

- [ ] **Task 6** — Delete `TemplateCreationMethodSelector.tsx`; verify no dangling imports; `npm run build` green
- [ ] **Task 7** — `en.json` + `fr.json`: add new strings (uploadPdfInstead, backToGallery, useAsIs, customize, nameRequired, descriptionRequired)
- [ ] **Final Checkpoint**: check-types + test + build + lint all green
