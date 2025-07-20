import { expect, test } from '@playwright/test';

const email = process.env.E2E_CLERK_USER_USERNAME;
const password = process.env.E2E_CLERK_USER_PASSWORD;
// eslint-disable-next-line no-console
console.log({ email, password });

test('Login and verify dashboard loads with templates table and actions', async ({ page }) => {
  await page.goto('https://templify-dashboard-dev.vercel.app/sign-in');
  await page.getByPlaceholder('Enter your email address').fill(email as string);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByPlaceholder('Enter your password').fill(password as string);
  await page.getByRole('button', { name: 'Continue' }).click();

  // Dashboard assertions
  await expect(page.getByRole('button', { name: 'Create Template' })).toBeVisible();
  await expect(page.getByPlaceholder('Search templates...')).toBeVisible();

  // Check if table has at least one row
  const parentBody = page.locator('table tbody');
  const totalRows = await parentBody.locator('tr').count();

  expect(totalRows).toBeGreaterThan(0);

  // Logout
  await page.getByLabel('Open user button').click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await page.close();
});
