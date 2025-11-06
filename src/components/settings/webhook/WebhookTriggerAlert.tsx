import { AlertTriangle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const WebhookTriggerAlert = () => {
  return (
    <Alert className="border-amber-200 bg-amber-50">
      <AlertTriangle className="size-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Webhook Trigger Requirement</AlertTitle>
      <AlertDescription className="text-amber-700">
        <p className="mb-2">
          Webhooks are only triggered when the
          {' '}
          <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">/convert</code>
          {' '}
          API is invoked in async mode:
        </p>
        <ul className="list-inside list-disc space-y-1 text-sm">
          <li>
            Using the
            {' '}
            <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">Prefer: respond-async</code>
            {' '}
            header, OR
          </li>
          <li>
            Using the
            {' '}
            <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">?mode=async</code>
            {' '}
            query parameter
          </li>
        </ul>
        <p className="mt-2 text-xs">
          Synchronous requests (default or
          {' '}
          <code className="rounded bg-amber-100 px-1 py-0.5">?mode=sync</code>
          ) will
          not trigger webhooks.
        </p>
      </AlertDescription>
    </Alert>
  );
};
