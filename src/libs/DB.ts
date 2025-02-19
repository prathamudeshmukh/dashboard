import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-serverless';

import * as schema from '@/models/Schema';

config({ path: '.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL!, ssl: {
  rejectUnauthorized: false,
} });

export const db = drizzle(pool, { schema });
