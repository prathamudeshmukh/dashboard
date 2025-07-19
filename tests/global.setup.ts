import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { test as setup } from '@playwright/test';

// Configure Playwright with Clerk
setup('setup', async () => {
  await clerkSetup();
});

// Define the path to the storage file, which is `user.json`
const authFile = 'tests/auth.json';

setup('authenticate and save state to storage', async ({ page }) => {
  // Perform authentication steps.
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
});
