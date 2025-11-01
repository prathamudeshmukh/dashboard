import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

const email = process.env.E2E_CLERK_USER_USERNAME;
const password = process.env.E2E_CLERK_USER_PASSWORD;
// eslint-disable-next-line no-console
console.log({ email, password });

test('global setup', async ({}) => {
  await clerkSetup();
});

test('Login and verify dashboard loads with templates table and actions', async ({ page }) => {
  await page.goto('/');
  await clerk.signIn({
    page,
    signInParams: {
      strategy: 'password',
      identifier: process.env.E2E_CLERK_USER_USERNAME!,
      password: process.env.E2E_CLERK_USER_PASSWORD!,
    },
  });

  // Dashboard assertions
  await expect(page.getByRole('button', { name: 'Create Template' })).toBeVisible();
  await expect(page.getByPlaceholder('Search templates...')).toBeVisible();

  // Check if table has at least one row
  const parentBody = page.locator('table tbody');
  const totalRows = await parentBody.locator('tr').count();

  expect(totalRows).toBeGreaterThan(0);

  // Logout
  await page.getByLabel('Open user menu').click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await page.close();
});
