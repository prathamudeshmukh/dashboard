import * as path from 'node:path';

import { BrowserCheck, Frequency } from 'checkly/constructs';

/* eslint-disable no-new */
new BrowserCheck('dashboard-check', {
  name: 'Dashboard check',
  frequency: Frequency.EVERY_10M,
  locations: ['us-east-1', 'eu-west-1'],
  code: {
    entrypoint: path.join(__dirname, 'dashboard.spec.ts'),
  },
});
