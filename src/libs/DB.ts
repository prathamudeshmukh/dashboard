import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

import * as schema from '@/models/Schema';

import { Env } from './Env';

const pool = new Pool({ connectionString: Env.DATABASE_URL });
const client = await pool.connect();

export const db = drizzle(client, { schema });
