/* eslint-disable no-console */
// Global setup file for integration tests
// This file is imported by vitest.integration.config.mts

import { afterAll, beforeAll } from 'vitest';

import { cleanupTestDb, closeTestDb } from '@/libs/test-db';

// Validate required environment variables on test suite startup
const requiredEnvVars = [
  'DATABASE_URL_TEST',
  'JOB_RUNNER_BASE_URL',
  'JOB_RUNNER_TOKEN',
  'ENCRYPTION_KEY',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(
      `Missing required environment variable: ${envVar}\n`
      + `Please copy .env.test.example to .env.test and fill in the values.`,
    );
  }
});

// Global setup - runs once before all tests
beforeAll(async () => {
  console.log('🚀 Starting integration test infrastructure...');

  // Initial cleanup to ensure clean state
  await cleanupTestDb();

  console.log('✅ Integration test infrastructure ready');
}, 30000);

// Global cleanup - runs once after all tests
afterAll(async () => {
  console.log('🧹 Cleaning up integration test infrastructure...');

  // Final cleanup
  await cleanupTestDb();

  // Close database connections
  await closeTestDb();

  console.log('✅ Integration test infrastructure cleaned up');
}, 30000);
