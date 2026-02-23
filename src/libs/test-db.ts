import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from '../models/Schema';

let testPool: Pool | null = null;
let testDb: ReturnType<typeof drizzle> | null = null;

/**
 * Get or create the test database connection.
 * Uses DATABASE_URL_TEST environment variable.
 *
 * @throws {Error} If DATABASE_URL_TEST is not set
 * @returns {Promise<ReturnType<typeof drizzle>>} Drizzle database instance
 */
export async function getTestDb() {
  if (!process.env.DATABASE_URL_TEST) {
    throw new Error(
      'DATABASE_URL_TEST environment variable is not set.\n'
      + 'Please copy .env.test.example to .env.test and configure the test database URL.',
    );
  }

  if (!testDb) {
    testPool = new Pool({
      connectionString: process.env.DATABASE_URL_TEST,
      // For local development, SSL is typically not needed
      // Set ssl: { rejectUnauthorized: false } for cloud databases
    });
    testDb = drizzle(testPool, { schema });
  }

  return testDb;
}

/**
 * Clean up all test data from the database.
 * Truncates all tables in reverse dependency order to avoid foreign key violations.
 *
 * @returns {Promise<void>}
 */
export async function cleanupTestDb() {
  if (!testDb) {
    await getTestDb();
  }

  const db = await getTestDb();

  // Truncate all tables in reverse dependency order
  // This ensures foreign key constraints are not violated
  await db.execute(sql`
    TRUNCATE TABLE 
      generated_templates,
      webhook_deliveries,
      webhook_events,
      credit_transactions,
      apikeys,
      templates,
      template_gallery,
      webhook_endpoints,
      users
    CASCADE
  `);
}

/**
 * Close the test database connection pool.
 * Should be called in global test cleanup (afterAll).
 *
 * @returns {Promise<void>}
 */
export async function closeTestDb() {
  if (testPool) {
    await testPool.end();
    testPool = null;
    testDb = null;
  }
}
