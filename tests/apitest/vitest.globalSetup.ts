import { startTestDb, stopTestDb } from './test-db';

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var testDb: Awaited<ReturnType<typeof startTestDb>>['db'];
}

beforeAll(async () => {
  process.env.TESTCONTAINERS_RYUK_DISABLED = 'true';

  const { db } = await startTestDb();

  // eslint-disable-next-line no-restricted-globals
  global.testDb = db;
}, 60_000);

afterAll(async () => {
  await stopTestDb();
});
