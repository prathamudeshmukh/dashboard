import { config } from 'dotenv';
import { Pool } from 'pg';

config({ path: '.env.test' });

async function resetTestDb() {
  if (!process.env.DATABASE_URL_TEST) {
    console.error('❌ DATABASE_URL_TEST environment variable is not set');
    console.error('Please copy .env.test.example to .env.test and configure it');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL_TEST,
  });

  try {
    console.log('🗑️  Dropping all tables...');

    await pool.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO test;
      GRANT ALL ON SCHEMA public TO public;
    `);

    console.log('✅ Test database reset successfully');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Run migrations: npm run db:migrate:test');
    console.log('  2. Run tests: npm run test:integration');
  } catch (error) {
    console.error('❌ Error resetting test database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetTestDb();
