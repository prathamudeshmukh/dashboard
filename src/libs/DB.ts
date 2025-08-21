/* eslint-disable no-console */

import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-serverless';

import * as schema from '../models/Schema';

config({ path: '.env' });

console.log({ DATABASE_URL: process.env.DATABASE_URL });

// Set WebSocket constructor globally for Neon serverless
if (typeof globalThis !== 'undefined' && typeof WebSocket !== 'undefined') {
  (globalThis as any).WebSocket = WebSocket;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool, { schema });
