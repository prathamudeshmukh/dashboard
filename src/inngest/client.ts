import { Inngest } from 'inngest';

// Create a client to send and receive events
export const inngest = new Inngest({
  id: 'templify-app',
  env: process.env.INNGEST_ENV || process.env.VERCEL_GIT_COMMIT_REF || 'develop',
});
