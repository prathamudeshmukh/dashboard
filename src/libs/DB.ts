/* eslint-disable no-console */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool as PgPool } from 'pg';

import * as schema from '../models/Schema';

// Load environment variables - try multiple env files
config({ path: '.env' });
config({ path: '.env.local' });
config({ path: '.env.production' });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!');
  throw new Error('DATABASE_URL environment variable is required');
}

// Validate and potentially modify the connection string for Neon
let connectionString = process.env.DATABASE_URL;

// Ensure the connection string has the correct format for Neon
if (!connectionString.includes('sslmode=require')) {
  // Add sslmode=require if not present
  const separator = connectionString.includes('?') ? '&' : '?';
  connectionString = `${connectionString}${separator}sslmode=require`;
}

// Function to create serverless pool
async function createServerlessPool() {
  try {
    const { Pool: ServerlessPool } = await import('@neondatabase/serverless');
    const { drizzle: serverlessDrizzle } = await import('drizzle-orm/neon-serverless');

    const pool = new ServerlessPool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // Test the connection
    await pool.query('SELECT 1');
    console.log('✅ Using Neon serverless driver');

    return {
      pool,
      drizzle: serverlessDrizzle,
      type: 'serverless',
    };
  } catch {
    console.log('⚠️ Serverless driver failed, falling back to regular pg driver');
    return null;
  }
}

// Function to create regular pg pool
function createPgPool() {
  const poolConfig = {
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    // Connection pool settings for VPS environment
    max: 20, // Maximum number of connections in the pool
    min: 2, // Minimum number of connections in the pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
    // Additional settings for VPS
    allowExitOnIdle: false, // Don't exit when idle
    maxUses: 7500, // Close and replace a connection after it has been used 7500 times
  };

  const pool = new PgPool(poolConfig);
  console.log('✅ Using regular pg driver');

  return {
    pool,
    drizzle,
    type: 'pg',
  };
}

// Initialize database connection with fallback
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let poolInstance: any = null;

async function initializeDatabase() {
  // Try serverless driver first
  const serverlessResult = await createServerlessPool();

  if (serverlessResult) {
    poolInstance = serverlessResult.pool;
    dbInstance = serverlessResult.drizzle(poolInstance, { schema });
  } else {
    // Fallback to regular pg driver
    const pgResult = createPgPool();
    poolInstance = pgResult.pool;
    dbInstance = pgResult.drizzle(poolInstance, { schema });
  }

  // Add error handlers
  poolInstance.on('connect', () => {
    console.log('✅ Database connection established');
  });

  poolInstance.on('error', (err: any) => {
    console.error('❌ Database connection error:', err);
  });

  return dbInstance;
}

// Initialize and export
const db = await initializeDatabase();
export { db };
