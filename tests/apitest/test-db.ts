import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { GenericContainer } from 'testcontainers';

import * as schema from '@/models/Schema';

let container: Awaited<ReturnType<PostgreSqlContainer['start']>> | null = null;
let pool: Pool | null = null;

export async function startTestDb() {
  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('testdb')
    .withUsername('testuser')
    .withPassword('testpass')
    .withStartupTimeout(120_000)
    .start();

  // Start Redis container for rate limiting
  const redisContainer = await new GenericContainer('redis:7-alpine')
    .withExposedPorts(6379)
    .start();

  const testDatabaseUrl = container.getConnectionUri();
  process.env.DATABASE_URL = testDatabaseUrl;
  process.env.KV_REST_API_URL = `http://${redisContainer.getHost()}:${redisContainer.getMappedPort(6379)}`;
  process.env.KV_REST_API_TOKEN = 'test-token';

  pool = new Pool({
    connectionString: testDatabaseUrl,
  });

  const db = drizzle(pool, { schema });

  await migrate(db, { migrationsFolder: 'migrations' });

  return { db, pool, testDatabaseUrl };
}

export async function stopTestDb() {
  await pool?.end();
  pool = null;
  await container?.stop();
  container = null;
}
