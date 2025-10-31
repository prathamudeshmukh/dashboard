import { test } from '@playwright/test';

import { fillTemplateDetails, finishEditorStep, goToDashboardAndVerify, navigateToPdfUpload, uploadPDF, verifyPreviewAndPublish } from '../helpers/templateFlow';

test.describe('Visual Editor Template creation flow using Upload PDF', () => {
  const uploadedPdfName = 'Demo Test';
  const uploadedPdfDescription = 'Demo Description';
  let createdTemplateId: string;

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/dashboard`);
  });

  test('Complete template creation and verify dashboard entry', async ({ page }) => {
    test.slow();

    await navigateToPdfUpload(page);
    await uploadPDF(page, 'config/pdf_without_header.pdf');
    await fillTemplateDetails(page, uploadedPdfName, uploadedPdfDescription);
    await finishEditorStep(page, true); // visual editor
    createdTemplateId = await verifyPreviewAndPublish(page, uploadedPdfName);
    await goToDashboardAndVerify(page, uploadedPdfName, createdTemplateId);

    await page.close();
  });
});
