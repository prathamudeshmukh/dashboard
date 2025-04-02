'use client';

import { Copy, Eye, EyeOff, Info, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getClientSecret } from '@/libs/actions/user';

export default function APIKeys({ clientId }: { clientId: string }) {
  const [showSecret, setShowSecret] = useState(false);
  const [showQuickCopySecret, setShowQuickCopySecret] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSecret = async () => {
    if (clientSecret) {
      return;
    }
    setLoading(true);
    try {
      const result = await getClientSecret(clientId);
      if (result?.clientSecret) {
        setClientSecret(result.clientSecret);
      } else {
        toast.error('Failed to retrieve client secret.');
      }
    } catch (error) {
      toast.error(`Error fetching client secret - ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSecretVisibility = async (
    setState: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    if (!clientSecret) {
      await fetchSecret();
    }
    setState(prev => !prev);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="break-words text-4xl font-bold text-foreground">API Keys</h1>

        <Card className="space-y-4 bg-black p-4 text-white sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">Quick Copy</h2>
          </div>

          <p className="break-words text-gray-400">
            Copy these environment variables into your project.
          </p>

          <div className="space-y-2 rounded-lg bg-zinc-900 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-zinc-800 px-2 py-1 text-sm text-white">.env.local</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-zinc-800 hover:text-white"
                  onClick={() => toggleSecretVisibility(setShowQuickCopySecret)}
                >
                  {loading
                    ? (
                        <Loader2 className="size-4 animate-spin" />
                      )
                    : showQuickCopySecret
                      ? (
                          <EyeOff className="size-4" />
                        )
                      : (
                          <Eye className="size-4" />
                        )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-zinc-800 hover:text-white"
                  onClick={() => copyToClipboard(clientSecret || '')}
                  disabled={!clientSecret}
                >
                  <Copy className="size-4" />
                  <span className="ml-2">Copy</span>
                </Button>
              </div>
            </div>
            <div className="space-y-1 break-all font-mono text-sm">
              <p className="text-gray-400">
                {`CLIENT_ID= ${clientId}` }
              </p>
              <p className="text-gray-400">
                CLIENT_SECRET=
                {
                  showQuickCopySecret
                    ? clientSecret || 'Loading...'
                    : '••••••••••••••••••••••••••••••••••••••••••'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Info className="size-4 shrink-0" />
            <p className="break-words">
              These are the same Client ID and Secret as you see below.
            </p>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="break-words text-2xl font-semibold">Client ID</h2>
          <p className="break-words text-muted-foreground">
            This ID should be used in your frontend code. It can be safely shared and does not need to be kept secret.
          </p>

          <Card className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Client ID</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  copyToClipboard(clientId)}
              >
                <Copy className="mr-2 size-4" />
                Copy
              </Button>
            </div>
            <p className="mt-2 break-all font-mono text-sm text-muted-foreground">
              {clientId}
            </p>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="break-words text-2xl font-semibold">Client Secret</h2>
          <p className="break-words text-muted-foreground">
            Securely manage these sensitive keys. If compromised, create a new one and delete the old one.
          </p>

          <Card className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold">Client Secret</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSecretVisibility(setShowSecret)}
                >
                  {loading
                    ? (
                        <Loader2 className="size-4 animate-spin" />
                      )
                    : showSecret
                      ? (
                          <EyeOff className="size-4" />
                        )
                      : (
                          <Eye className="size-4" />
                        )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(clientSecret || '')}
                  disabled={!clientSecret}
                >
                  <Copy className="mr-2 size-4" />
                  Copy
                </Button>
              </div>
            </div>
            <p className="mt-2 break-all font-mono text-sm text-muted-foreground">
              {showSecret ? clientSecret || 'Loading...' : '••••••••••••••••••••••••••••••••••••••••••'}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
