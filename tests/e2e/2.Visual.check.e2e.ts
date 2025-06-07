import percySnapshot from '@percy/playwright';
import { expect, test } from '@playwright/test';

test.describe('Visual testing', () => {
  test.describe('Static pages', () => {
    test('should take screenshot of the homepage', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByText('Effortless PDF Generation for SaaS Applications')).toBeVisible();

      await percySnapshot(page, 'Homepage');
      await page.close();
    });
  });
});
