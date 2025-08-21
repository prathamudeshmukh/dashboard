/* eslint-disable no-console */

import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-serverless';

import * as schema from '../models/Schema';

config({ path: '.env' });

console.log({ DATABASE_URL: process.env.DATABASE_URL });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: {
    rejectUnauthorized: false,
  },
  // Pass WebSocket constructor directly if available
  ...(typeof WebSocket !== 'undefined' && { WebSocketConstructor: WebSocket }),
});

export const db = drizzle(pool, { schema });
