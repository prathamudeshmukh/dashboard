import { useCallback, useState } from 'react';

import { isValidWebhookUrl } from '@/utils/Webhooks';

const SAVE_SUCCESS_DURATION = 3000;

export const useWebhookForm = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const updateUrl = useCallback((url: string) => {
    setWebhookUrl(url);
    setIsSaved(false);
  }, []);

  const clearUrl = useCallback(() => {
    setWebhookUrl('');
    setIsSaved(false);
  }, []);

  const saveConfiguration = useCallback((secret: string) => {
    // TODO: Replace with actual API call
    // eslint-disable-next-line no-console
    console.log('[v0] Saving webhook configuration:', {
      url: webhookUrl,
      secret,
      events: ['pdf.generated', 'pdf.failed', 'pdf.started'],
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), SAVE_SUCCESS_DURATION);
  }, [webhookUrl]);

  const markAsUnsaved = useCallback(() => {
    setIsSaved(false);
  }, []);

  const isValid = isValidWebhookUrl(webhookUrl);

  return {
    webhookUrl,
    isSaved,
    isValid,
    updateUrl,
    clearUrl,
    saveConfiguration,
    markAsUnsaved,
  };
};
