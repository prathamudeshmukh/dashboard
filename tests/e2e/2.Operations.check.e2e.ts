import { expect, test } from '@playwright/test';

test.describe('Operations', () => {
  test.describe('Template Gallery', () => {
    test('should create template from gallery', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/dashboard`);
      await page.getByRole('button', { name: 'Create Template' }).click();
      await page.getByText('Template GalleryChoose from').click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.locator('div').filter({ hasText: /^Resume TemplateProfessional resume\/CV for job applicationsUse Template$/ }).getByRole('button').click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Save & Publish' }).click();

      await expect(page.getByText('Your template "Resume')).toBeVisible();
      await expect(page.locator('body')).toContainText('Your template "Resume Template" has been created and is ready to use.');

      await page.close();
    });
  });
});
