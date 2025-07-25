import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

// Use process.env.PORT by default and fallback to port 3000
// const PORT = process.env.PORT || 3000;

// Set webServer.url and use.baseURL with the location of the WebServer respecting the correct set port
const baseURL = process.env.ENVIRONMENT_URL;
const isDeployedEnv = !!process.env.ENVIRONMENT_URL && process.env.CI;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // Limit the number of workers on CI, use default locally
  workers: process.env.CI ? 1 : undefined,
  testDir: './tests',
  // Look for files with the .spec.js or .e2e.js extension
  testMatch: '*.@(spec|e2e).?(c|m)[jt]s?(x)',
  // Timeout per test
  timeout: 30 * 1000,
  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,
  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: process.env.CI
    ? [['list'], ['github'], ['html', { outputFolder: 'playwright-report', open: 'never' }], ['junit', { outputFile: 'results.xml' }]]
    : 'list',

  expect: {
    // Set timeout for async expect matchers
    timeout: 10 * 1000,
  },

  // Run your local dev server before starting the tests:
  // https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests
  ...(isDeployedEnv
    ? {}
    : {
        webServer: {
          command: process.env.CI ? 'npm run start' : 'npm run dev:next',
          url: baseURL,
          timeout: 2 * 60 * 1000,
          reuseExistingServer: !process.env.CI,
        },
      }),

  // Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions.
  use: {
    // Use baseURL so to make navigations relative.
    // More information: https://playwright.dev/docs/api/class-testoptions#test-options-base-url
    baseURL,

    // Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer
    trace: process.env.CI ? 'retain-on-failure' : undefined,

    // Record videos when retrying the failed test.
    video: process.env.CI ? 'retain-on-failure' : undefined,
  },

  projects: [
    // `setup` and `teardown` are used to run code before and after all E2E tests.
    // These functions can be used to configure Clerk for testing purposes. For example, bypassing bot detection.
    // In the `setup` file, you can create an account in `Test mode`.
    // For each test, an organization can be created within this account to ensure total isolation.
    // After all tests are completed, the `teardown` file can delete the account and all associated organizations.
    // You can find the `setup` and `teardown` files at: https://nextjs-boilerplate.com/pro-saas-starter-kit
    { name: 'setup', testMatch: /global\.setup\.ts/, teardown: 'teardown' },
    { name: 'teardown', testMatch: /.*\.teardown\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],

        // Use prepared Clerk auth state
        storageState: 'playwright/.clerk/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
