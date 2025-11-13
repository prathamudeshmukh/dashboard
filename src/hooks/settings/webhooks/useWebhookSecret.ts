'use client';

import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getOrCreateWebhookEndpoint } from '@/libs/actions/user';

const COPY_SUCCESS_DURATION = 2000;

export const useWebhookSecret = () => {
  const [secret, setSecret] = useState('');
  const [encryptedSecret, setEncryptedSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);
  const { user } = useUser();

  // 🧠 Fetch existing or create new secret on mount
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const fetchSecret = async () => {
      try {
        const result = await getOrCreateWebhookEndpoint(user.id);
        if (result?.success) {
          setSecret(result.secret);
          setEncryptedSecret(result.encryptedSecret as string);
          if (result.created) {
            toast.success('Webhook secret generated');
          }
        }
      } catch (err) {
        toast.error('Failed to load webhook secret');
        console.error('[WebhookSecretFetchError]', err);
      }
    };

    fetchSecret();
  }, [user?.id]);

  const toggleVisibility = useCallback(() => {
    setShowSecret(prev => !prev);
  }, []);

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(secret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), COPY_SUCCESS_DURATION);
  }, [secret]);

  const regenerateSecret = useCallback(async () => {
    if (
      // eslint-disable-next-line no-alert
      confirm(
        'Are you sure you want to regenerate the webhook secret? This will invalidate the current secret and you\'ll need to update your webhook endpoint.',
      )
    ) {
      const res = await getOrCreateWebhookEndpoint(user?.id as string); // reuse same for demo
      if (res.success) {
        setSecret(res.secret);
      }
      setEncryptedSecret(res.encryptedSecret as string);
      return true;
    }
    return false;
  }, [user?.id]);

  return {
    secret,
    encryptedSecret,
    showSecret,
    secretCopied,
    toggleVisibility,
    copyToClipboard,
    regenerateSecret,
  };
};
