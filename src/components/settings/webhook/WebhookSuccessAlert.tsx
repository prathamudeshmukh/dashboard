import { CheckCircle2 } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type WebhookSuccessAlertProps = {
  show: boolean;
};

export const WebhookSuccessAlert = ({ show }: WebhookSuccessAlertProps) => {
  if (!show) {
    return null;
  }

  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle2 className="size-4 text-green-600" />
      <AlertTitle className="text-green-800">Configuration saved</AlertTitle>
      <AlertDescription className="text-green-700">
        Your webhook configuration has been updated successfully
      </AlertDescription>
    </Alert>
  );
};
