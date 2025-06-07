/* eslint-disable no-console */

import path from 'node:path';

import { chromium, test as setup } from '@playwright/test';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: path.resolve(__dirname, '.env') });

const AUTH_FILE_PATH = path.join(__dirname, 'auth.json');
const USER_DATA_DIR = path.join(__dirname, 'chrome-user-data');

setup('Authenticate via Google or use existing session from profile', async () => {
  setup.setTimeout(180_000); // Increased timeout for the entire setup process (3 minutes)
  console.log(`Using user data directory: ${USER_DATA_DIR}`);
  console.log(`Authentication state will be saved to: ${AUTH_FILE_PATH}`);

  // Launch browser with a persistent user profile
  const browserContext = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false, // Must be false for potential Google login UI and manual interaction
    args: [
      '--disable-blink-features=AutomationControlled', // Helps Playwright appear less like a bot
      // Consider other args if needed, but use sparingly:
      // '--no-sandbox', // If running in certain CI environments
      // '--disable-dev-shm-usage' // If running in certain CI environments
    ],
    viewport: { width: 1280, height: 720 }, // Consistent viewport size
    // slowMo: 50, // Optional: Slows down Playwright operations by 50ms. Useful for debugging.
  });

  // Get the first page if context was launched with one, or create a new one
  const page = browserContext.pages().length > 0 ? browserContext.pages()[0] : await browserContext.newPage();
  console.log('Browser context and page launched/retrieved.');

  try {
    await page?.goto('https://templify-dashboard-dev.vercel.app/', { waitUntil: 'networkidle', timeout: 45000 });
    console.log('Navigated to application homepage.');

    // Check if already logged in by looking for a "Sign Out" button
    const signOutButtonLocator = page?.getByRole('button', { name: 'Sign Out', exact: true });
    let isLoggedIn = false;

    try {
      console.log('Checking for "Sign Out" button to determine login status...');
      // Wait for the button to potentially appear, especially on SPAs
      await signOutButtonLocator?.waitFor({ state: 'visible', timeout: 15000 }); // Wait up to 15 seconds
      isLoggedIn = await signOutButtonLocator?.isVisible() as boolean;
      if (isLoggedIn) {
        console.log('✅ "Sign Out" button is visible. User is already logged in.');
      } else {
        // This else might not be strictly necessary if waitFor throws on not visible
        console.log('"Sign Out" button not visible after waiting.');
      }
    } catch (error) {
      // waitFor will throw if the element is not visible within the timeout
      console.error(`"Sign Out" button not found or not visible within timeout, assuming user is not logged in. - ${error}`);
      isLoggedIn = false;
    }

    if (!isLoggedIn) {
      console.log('User is not logged in. Proceeding with the Google Sign-In flow...');

      // Navigate to login via "Sign Up" button (as per your app's flow)
      const signUpButtonLocator = page?.getByRole('button', { name: 'Sign Up', exact: true });
      try {
        console.log('Attempting to click "Sign Up" button...');
        await signUpButtonLocator?.waitFor({ state: 'visible', timeout: 10000 });
        await signUpButtonLocator?.click();
        console.log('Clicked "Sign Up" button.');
      } catch (error) {
        console.error('Error clicking "Sign Up" button. This is the entry point for login when logged out.', error);
        // If the "Sign Up" button itself is not found, the login flow cannot proceed as described.
        // This could happen if the page structure changed or if there's an unexpected state.
        throw new Error('Failed to find or click the "Sign Up" button to initiate login.');
      }

      await page?.getByRole('link', { name: 'Sign in' }).click();
      console.log('Clicked "Sign in" link.');

      await page?.getByRole('button', { name: 'Sign in with Google Google' }).click();
      console.log('Clicked "Sign in with Google" button.');

      // User interaction prompt

      console.log('--------------------------------------------------------------------------');
      console.log('👉 ACTION REQUIRED: Please complete the Google Sign-In in the browser.');
      console.log('   This may involve entering your credentials, 2FA, and handling any Google prompts.');
      console.log('   After successful sign-in, Google should redirect you back to your application.');
      console.log('   Playwright will wait for you to land on a page containing "/dashboard".');
      console.log('   You have up to 2 minutes for this manual step.');
      console.log('--------------------------------------------------------------------------');

      // Wait for successful login and navigation to a URL containing "/dashboard"
      // Using a more flexible URL matcher for robustness.
      await page?.waitForURL('**/dashboard', { timeout: 120_000 }); // Wait up to 2 minutes
      console.log(`Successfully navigated to a URL containing "/dashboard". Current URL: ${page?.url()}`);
      console.log('Login presumed successful.');
    }

    // Save authentication state regardless of whether login was skipped or performed
    await browserContext.storageState({ path: AUTH_FILE_PATH });
    console.log(`✅ Authentication state saved successfully to: ${AUTH_FILE_PATH}`);
  } catch (error) {
    console.error('❌ An error occurred during the authentication setup:', error);
    const screenshotPath = path.join(__dirname, `error-screenshot-${Date.now()}.png`);
    try {
      await page?.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Screenshot taken on error: ${screenshotPath}`);
    } catch (screenshotError) {
      console.error('Failed to take screenshot on error:', screenshotError);
    }
    throw error; // Re-throw the error to ensure the setup is marked as failed
  } finally {
    console.log('Closing browser context...');
    await browserContext.close();
    console.log('Browser context closed. Setup finished.');
  }
});
