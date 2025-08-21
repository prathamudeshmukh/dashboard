import path from 'node:path';

import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { verifyDashboardEntry, verifyEditorComponents, verifySuccessPage, verifyVisualEditorComponents } from './assertions';

export async function navigateToPdfUpload(page: Page) {
  await page.getByRole('button', { name: 'Create Template' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
}

export async function uploadPDF(page: Page, pdfPathRelative: string) {
  const filePath = path.join(__dirname, '..', pdfPathRelative);
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('button:has-text("Browse Files")').click(),
  ]);

  await fileChooser.setFiles(filePath);

  await expect(page.getByRole('heading')).toContainText('PDF Processed Successfully', { timeout: 40000 });
  await expect(page.locator('body')).toContainText('HTML structure generated');
  await expect(page.locator('body')).toContainText('Template ready for customization');
}

export async function fillTemplateDetails(page: Page, name: string, description: string) {
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByTestId('template-name-input').fill(name);
  await page.locator('textarea').fill(description);
  await page.getByRole('button', { name: 'Next' }).click();
}

export async function finishEditorStep(page: Page, isVisualEditor: boolean) {
  if (isVisualEditor) {
    await page.getByRole('button', { name: 'Switch to Visual Editor' }).click();
    await page.getByRole('button', { name: 'Yes, Switch' }).click();
    await verifyVisualEditorComponents(page);
  } else {
    await verifyEditorComponents(page);
  }
  await page.getByRole('button', { name: 'Next' }).click();
}

export async function verifyPreviewAndPublish(page: Page, name: string): Promise<string> {
  await expect(page.getByText(`DetailsName: ${name}`)).toBeVisible();
  await expect(page.getByTitle('Preview')).toBeVisible();

  await page.getByRole('button', { name: 'Save & Publish' }).click();
  await verifySuccessPage(page, name);

  return (await page.getByTestId('template-id').textContent()) as string;
}

export async function goToDashboardAndVerify(page: Page, name: string, id: string) {
  await page.getByTestId('dashboard-btn').click();
  await page.waitForURL('/dashboard');
  await verifyDashboardEntry(page, name, id);
}
