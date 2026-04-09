import fs from 'node:fs/promises';
import path from 'node:path';

import { spec } from '@/openapi/spec';

async function main(): Promise<void> {
  const out = path.join(process.cwd(), 'public', 'openapi.json');
  await fs.writeFile(out, JSON.stringify(spec, null, 2));
  // eslint-disable-next-line no-console
  console.log('✓ OpenAPI spec written to public/openapi.json');
}

main().catch((err) => {
  console.error('✗ Failed to generate OpenAPI spec:', err);
  process.exit(1);
});
