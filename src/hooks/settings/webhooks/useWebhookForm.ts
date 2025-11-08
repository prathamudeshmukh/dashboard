'use client';

import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getOrCreateWebhookEndpoint, saveWebhookEndpoint } from '@/libs/actions/user';
import { isValidWebhookUrl } from '@/utils/Webhooks';

const SAVE_SUCCESS_DURATION = 3000;

export const useWebhookForm = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useUser();

  // ✅ Fetch existing URL on mount
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const fetchWebhookConfig = async () => {
      try {
        const result = await getOrCreateWebhookEndpoint(user.id);
        if (result.success) {
          setWebhookUrl(result.url || '');
          if (result.exists) {
            toast.info('Loaded existing webhook configuration');
          } else {
            toast.success('Generated new webhook secret');
          }
        }
      } catch (err) {
        console.error('[Webhook Fetch Error]', err);
        toast.error('Failed to load webhook configuration');
      }
    };

    fetchWebhookConfig();
  }, [user?.id]);

  const updateUrl = useCallback((url: string) => {
    setWebhookUrl(url);
    setIsSaved(false);
  }, []);

  const clearUrl = useCallback(() => {
    setWebhookUrl('');
    setIsSaved(false);
  }, []);

  const saveConfiguration = useCallback(async (webhookSecret: string) => {
    try {
      const result = await saveWebhookEndpoint({
        clientId: user?.id as string,
        url: webhookUrl,
        encryptedSecret: webhookSecret,
      });

      if (result.success) {
        toast.success('Webhook configuration saved!');
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), SAVE_SUCCESS_DURATION);
      } else {
        toast.error('Failed to save webhook configuration');
      }
    } catch (error) {
      console.error('[Webhook Save Error]', error);
      toast.error('Unexpected error saving webhook configuration');
    }
  }, [user?.id, webhookUrl]);

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
