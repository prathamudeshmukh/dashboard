import path from 'node:path';

import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { test as setup } from '@playwright/test';

// Configure Playwright with Clerk
setup('setup', async () => {
  await clerkSetup();
});

setup('authenticate and save state to storage', async ({ page }) => {
  // Perform authentication steps.
  const authFile = path.join(__dirname, '../playwright/.clerk/user.json');

  await page.goto('/');
  await clerk.signIn({
    page,
    signInParams: {
      strategy: 'password',
      identifier: process.env.E2E_CLERK_USER_USERNAME!,
      password: process.env.E2E_CLERK_USER_PASSWORD!,
    },
  });
  await page.goto('/dashboard');
  await page.context().storageState({ path: authFile });
  await page.close();
});
