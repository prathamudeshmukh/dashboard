import { CodeSnippet } from '@/components/CodeSnippet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { WEBHOOK_PAYLOAD_EXAMPLE, WEBHOOK_SIGNATURE_HEADER } from '../../../features/dashboard/settings/constants';

export const WebhookPayloadExample = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook Payload Example</CardTitle>
        <CardDescription>Example of the JSON payload sent to your webhook endpoint</CardDescription>
      </CardHeader>
      <CardContent className="prose prose-lg max-w-none dark:prose-invert">
        <CodeSnippet value={WEBHOOK_PAYLOAD_EXAMPLE} lineNumbers="off" />
        <div className="mt-4 rounded-lg">
          <p className="mb-2 text-sm font-medium">Headers:</p>
          <pre className="my-0 overflow-x-auto rounded-lg bg-gray-800 p-4 dark:bg-gray-800">
            <code>
              {WEBHOOK_SIGNATURE_HEADER}
              : sha256=abc123...
            </code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};
