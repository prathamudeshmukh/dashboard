'use client';

import { CopyIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { getClientSecret } from '@/libs/actions/user';

export function ShowClientSecret({ clientId }: { clientId: string }) {
  const [secret, setSecret] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleSecret = async () => {
    if (!clientId) {
      return;
    }

    if (secret) {
      setIsOpen(true);
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
      setIsOpen(true);
    } catch (error) {
      setError(`Failed to retrieve client Secret, ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(secret);
    toast.success('Client Secret copied to clipboard');
    setIsOpen(false);
  };

  return (
    <div className="mb-4 flex w-full">
      {error && <p className="mt-2 text-red-500">{error}</p>}

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger
          onClick={handleSecret}
          disabled={isLoading}
          className="rounded bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          {isLoading ? 'Loading...' : 'Show Client Secret'}
        </AlertDialogTrigger>

        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Client Secret</AlertDialogTitle>
            <AlertDialogDescription>
              <code className="whitespace-pre-wrap break-words text-sm tracking-tighter">{secret}</code>

            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded"
            >
              <CopyIcon />
              Copy Secret
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
