'use client';

import { Webhook } from 'lucide-react';

import AsyncActionButton from '@/components/AsyncActionButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import {
  WebhookEventsList,
  WebhookInfoAlert,
  WebhookPayloadExample,
  WebhookSecretInput,
  WebhookSecurityBestPractices,
  WebhookSignatureExamples,
  WebhookSuccessAlert,
  WebhookTriggerAlert,
  WebhookUrlInput,
  WebhookValidationAlert,
} from '../../../components/settings/webhook';
import { useWebhookForm } from '../../../hooks/settings/webhooks/useWebhookForm';
import { useWebhookSecret } from '../../../hooks/settings/webhooks/useWebhookSecret';
import { WEBHOOK_EVENTS } from './constants';

export default function WebhooksPage() {
  const { webhookUrl, isSaved, isValid, updateUrl, clearUrl, saveConfiguration, markAsUnsaved } = useWebhookForm();
  const {
    secret,
    encryptedSecret,
    showSecret,
    secretCopied,
    toggleVisibility,
    copyToClipboard,
    regenerateSecret,
  } = useWebhookSecret();

  const handleRegenerateSecret = async () => {
    const wasRegenerated = await regenerateSecret();
    if (wasRegenerated) {
      markAsUnsaved();
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="break-words text-4xl font-bold text-foreground">Webhooks</h1>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="size-5" />
                Webhook Configuration
              </CardTitle>
              <CardDescription>
                Configure a webhook endpoint to receive real-time notifications about PDF generation events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <WebhookInfoAlert />
              <WebhookTriggerAlert />

              <WebhookUrlInput value={webhookUrl} onChange={updateUrl} />

              <WebhookSecretInput
                secret={secret}
                showSecret={showSecret}
                secretCopied={secretCopied}
                onToggleVisibility={toggleVisibility}
                onCopy={copyToClipboard}
                onRegenerate={handleRegenerateSecret}
              />

              <WebhookEventsList events={WEBHOOK_EVENTS} />

              <WebhookValidationAlert show={!isValid && webhookUrl.trim() !== ''} />
              <WebhookSuccessAlert show={isSaved} />

              <div className="flex gap-3 pt-2">
                <AsyncActionButton
                  isDisabled={!isValid}
                  onClick={() => saveConfiguration(encryptedSecret)}
                  className="bg-primary text-white"

                >
                  Save Configuration
                </AsyncActionButton>
                <Button variant="outline" onClick={clearUrl}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          <WebhookPayloadExample />
          <WebhookSignatureExamples />
          <WebhookSecurityBestPractices />
        </div>
      </div>
    </div>
  );
}
