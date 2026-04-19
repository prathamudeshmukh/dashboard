import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { cleanupTestDb, closeTestDb, getTestDb } from '@/libs/test-db';
import { users } from '@/models/Schema';

describe('Test Database Setup', () => {
  beforeAll(async () => {
    await cleanupTestDb();
  });

  afterAll(async () => {
    await cleanupTestDb();
    await closeTestDb();
  });

  it('should connect to test database successfully', async () => {
    const db = await getTestDb();

    expect(db).toBeDefined();
  });

  it('should be able to query database tables', async () => {
    const db = await getTestDb();
    const result = await db.select().from(users).limit(1);

    expect(Array.isArray(result)).toBe(true);
  });

  it('should use separate test database (not production)', async () => {
    expect(process.env.DATABASE_URL_TEST).toBeDefined();
    expect(process.env.DATABASE_URL_TEST).not.toEqual(process.env.DATABASE_URL);
    expect(process.env.DATABASE_URL_TEST).toContain('test');
  });

  it('should cleanup database successfully', async () => {
    const db = await getTestDb();

    // Insert test data
    await db.insert(users).values({
      clientId: 'test-cleanup',
      username: 'testcleanup',
      email: 'cleanup@test.com',
      remainingBalance: 100,
    });

    // Cleanup
    await cleanupTestDb();

    // Verify cleanup
    const result = await db.select().from(users).limit(10);

    expect(result.length).toBe(0);
  });

  it('should throw error if DATABASE_URL_TEST is not set', async () => {
    const originalValue = process.env.DATABASE_URL_TEST;

    // Temporarily unset the env var
    delete process.env.DATABASE_URL_TEST;

    // Reset the singleton
    await closeTestDb();

    // Should throw
    await expect(getTestDb()).rejects.toThrow('DATABASE_URL_TEST environment variable is not set');

    // Restore
    process.env.DATABASE_URL_TEST = originalValue;
    await closeTestDb(); // Reset singleton again
  });
});
