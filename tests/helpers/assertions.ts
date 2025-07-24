import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export async function verifyEditorComponents(page: Page) {
  const editorFrame = page.getByTitle('Template Editor').contentFrame();

  await expect(editorFrame.locator('div').filter({ hasText: 'You\'re using the Code Editor' }).first()).toBeVisible();
  await expect(editorFrame.getByTestId('code-editor')).toBeVisible();
  await expect(editorFrame.getByTestId('json-editor')).toBeVisible();
  await expect(editorFrame.getByTestId('preview-panel')).toBeVisible();
}

export async function verifyVisualEditorComponents(page: Page) {
  await expect(page.getByText('Visual Editor')).toBeVisible();
  await expect(page.locator('.gjs-editor-wrapper')).toBeVisible();
  await expect(page.locator('iframe').first().contentFrame().locator('body')).toBeVisible();
  await expect(page.getByText('Layers')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Properties' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Styles' })).toBeVisible();
}

export async function verifySuccessPage(page: Page, templateName: string) {
  await expect(page.getByTestId('success-card')).toBeVisible();
  await expect(page.getByTestId('success-message')).toContainText(templateName);
  await expect(page.getByTestId('template-id')).toBeVisible();
}

export async function verifyDashboardEntry(page: Page, templateName: string, templateId: string) {
  const firstRow = page.locator('table tbody tr').first();

  await expect(firstRow).toContainText(templateName);
  await expect(firstRow).toContainText(templateId);
};
