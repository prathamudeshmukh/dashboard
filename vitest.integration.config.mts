import react from '@vitejs/plugin-react';
import { config } from 'dotenv';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// Load .env.test if it exists
config({ path: '.env.test' });

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    include: ['tests/integration/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    setupFiles: ['./tests/integration/setup.ts'],
    testTimeout: 30000, // 30 seconds per test
    hookTimeout: 30000, // 30 seconds for hooks
    pool: 'forks', // Run tests in separate processes for isolation
    poolOptions: {
      forks: {
        singleFork: true, // Sequential execution to avoid DB contention
      },
    },
    env: {
      NODE_ENV: 'test',
      DATABASE_URL_TEST: process.env.DATABASE_URL_TEST,
      JOB_RUNNER_BASE_URL: process.env.JOB_RUNNER_BASE_URL || 'http://localhost:3001',
      JOB_RUNNER_TOKEN: process.env.JOB_RUNNER_TOKEN || 'test-token',
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'test-encryption-key-32chars!!',
      KV_REST_API_URL: process.env.KV_REST_API_URL || 'http://localhost:8079',
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN || 'test-token',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.stories.tsx',
        '**/*.d.ts',
      ],
    },
  },
});
