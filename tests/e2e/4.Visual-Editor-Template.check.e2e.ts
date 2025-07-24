import { expect, test } from '@playwright/test';

import { verifyDashboardEntry, verifySuccessPage, verifyVisualEditorComponents } from '../helpers/assertions';
import { TemplateGalleryPage } from '../pages/template-gallery.page';

test.describe('Visual Editor Template creation flow using Template Gallery', () => {
  let selectedTemplateName: string;
  let createdTemplateId: string;

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/dashboard`);
  });

  test('Complete template creation and verify dashboard entry', async ({ page }) => {
    await test.step('Navigate to template creation', async () => {
      await page.getByRole('button', { name: 'Create Template' }).click();
      await page.getByText('Template GalleryChoose from').click(); ;
      await page.getByRole('button', { name: 'Next' }).click();
    });

    await test.step('Select template from gallery', async () => {
      const galleryPage = new TemplateGalleryPage(page);
      selectedTemplateName = await galleryPage.selectRandomTemplate();
    });

    await test.step('Complete template setup wizard', async () => {
      await page.getByRole('button', { name: 'Next' }).click();

      await expect(page.getByTestId('template-name-input')).toHaveValue(selectedTemplateName);

      await page.getByRole('button', { name: 'Next' }).click();

      // Switch to Visual Editor
      await page.getByRole('button', { name: 'Switch to Visual Editor' }).click();
      await page.getByRole('button', { name: 'Yes, Switch' }).click();
      await verifyVisualEditorComponents(page);
      await page.getByRole('button', { name: 'Next' }).click();

      await expect(page.getByText(`DetailsName: ${selectedTemplateName}`)).toBeVisible();
      await expect(page.getByTitle('Preview')).toBeVisible();
    });

    await test.step('Save and verify template creation', async () => {
      await page.getByRole('button', { name: 'Save & Publish' }).click();
      await verifySuccessPage(page, selectedTemplateName);
      createdTemplateId = await page.getByTestId('template-id').textContent() as string;
    });

    await test.step('Verify dashboard entry', async () => {
      await page.getByTestId('dashboard-btn').click();
      await page.waitForURL('/dashboard');
      await verifyDashboardEntry(page, selectedTemplateName, createdTemplateId);
      await page.close();
    });
  });
});
