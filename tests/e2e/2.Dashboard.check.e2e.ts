import { expect, test } from '@playwright/test';

const email = process.env.E2E_CLERK_USER_USERNAME;
const password = process.env.E2E_CLERK_USER_PASSWORD;

test('Login and verify dashboard loads with templates table and actions', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await page.getByRole('link', { name: 'Sign in' }).click();
  await page.getByPlaceholder('Enter your email address').fill(email!);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByPlaceholder('Enter your password').fill(password!);
  await page.getByRole('button', { name: 'Continue' }).click();

  // Dashboard assertions
  await expect(page.getByRole('button', { name: 'Create Template' })).toBeVisible();
  await expect(page.getByPlaceholder('Search templates...')).toBeVisible();
  await expect(page.locator('.mb-4 > .inline-flex')).toBeVisible();

  // Check if table has at least one row
  const parentBody = page.locator('table tbody');
  const totalRows = await parentBody.locator('tr').count();

  expect(totalRows).toBeGreaterThan(0);

  // Logout
  await page.getByLabel('Open user button').click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await page.close();
});
