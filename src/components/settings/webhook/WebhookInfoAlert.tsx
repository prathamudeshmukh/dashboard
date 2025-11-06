import { Info } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const WebhookInfoAlert = () => {
  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Info className="size-4 text-blue-600" />
      <AlertTitle className="text-blue-800">How webhooks work</AlertTitle>
      <AlertDescription className="text-blue-700">
        When events occur, we'll send a POST request to your webhook URL with event details in the request body.
      </AlertDescription>
    </Alert>
  );
};
