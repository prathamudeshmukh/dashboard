import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-serverless';

import * as schema from '@/models/Schema';

config({ path: '.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL!, ssl: {
  rejectUnauthorized: false,
} });
const client = await pool.connect();

export const db = drizzle(client, { schema });
