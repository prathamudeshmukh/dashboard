import { useCallback, useState } from 'react';

import { generateWebhookSecret } from '@/utils/Webhooks';

const COPY_SUCCESS_DURATION = 2000;

export const useWebhookSecret = (initialSecret?: string) => {
  const [secret, setSecret] = useState(() => initialSecret || generateWebhookSecret());
  const [showSecret, setShowSecret] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  const toggleVisibility = useCallback(() => {
    setShowSecret(prev => !prev);
  }, []);

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(secret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), COPY_SUCCESS_DURATION);
  }, [secret]);

  const regenerateSecret = useCallback(() => {
    if (
      // eslint-disable-next-line no-alert
      confirm(
        'Are you sure you want to regenerate the webhook secret? This will invalidate the current secret and you\'ll need to update your webhook endpoint.',
      )
    ) {
      setSecret(generateWebhookSecret());
      return true;
    }
    return false;
  }, []);

  return {
    secret,
    showSecret,
    secretCopied,
    toggleVisibility,
    copyToClipboard,
    regenerateSecret,
  };
};
