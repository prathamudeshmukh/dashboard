import { AlertTriangle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type WebhookValidationAlertProps = {
  show: boolean;
};

export const WebhookValidationAlert = ({ show }: WebhookValidationAlertProps) => {
  if (!show) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="size-4" />
      <AlertTitle>Invalid URL</AlertTitle>
      <AlertDescription>Please enter a valid URL starting with http:// or https://</AlertDescription>
    </Alert>
  );
};
