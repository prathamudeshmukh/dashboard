'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { getClientSecret } from '@/libs/actions/user';

export function ShowClientSecret({ clientId }: { clientId: string }) {
  const [secret, setSecret] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleSecret = async () => {
    if (!clientId) {
      return;
    }

    // If secret is already loaded and visible, just hide it
    if (secret && isVisible) {
      setIsVisible(false);
      return;
    }

    // If secret is loaded but hidden, show it
    if (secret && !isVisible) {
      setIsVisible(true);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await getClientSecret(clientId);

      if (!result) {
        return;
      }

      setSecret(result.clientSecret);
      setIsVisible(true);
    } catch (error) {
      setError(`Failed to retrieve client Secret, ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <Button
        onClick={handleSecret}
        disabled={isLoading}
        className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-blue-300"
      >
        {isLoading ? 'Loading...' : isVisible ? 'Hide Client Secret' : 'Show Client Secret' }
      </Button>

      {secret && isVisible && (
        <div className="mt-4">
          <p className="font-medium">Client Secret:</p>
          <code className="mt-1 block rounded bg-gray-100 p-2">
            {secret}
          </code>
        </div>
      )}

      {error && (
        <p className="mt-2 text-red-500">{error}</p>
      )}
    </div>
  );
}
