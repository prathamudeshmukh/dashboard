import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { WEBHOOK_PAYLOAD_EXAMPLE, WEBHOOK_SIGNATURE_HEADER } from '../../../features/dashboard/settings/constants';

export const WebhookPayloadExample = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook Payload Example</CardTitle>
        <CardDescription>Example of the JSON payload sent to your webhook endpoint</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md bg-muted p-4">
          <pre className="text-sm">
            <code>{WEBHOOK_PAYLOAD_EXAMPLE}</code>
          </pre>
        </div>
        <div className="mt-4 rounded-md border bg-muted/50 p-3">
          <p className="mb-2 text-sm font-medium">Headers:</p>
          <code className="text-xs">
            {WEBHOOK_SIGNATURE_HEADER}
            : sha256=abc123...
          </code>
        </div>
      </CardContent>
    </Card>
  );
};
