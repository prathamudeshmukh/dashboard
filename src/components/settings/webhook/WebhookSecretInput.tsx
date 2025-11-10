import { Copy, Eye, EyeOff, RefreshCw, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type WebhookSecretInputProps = {
  secret: string;
  showSecret: boolean;
  secretCopied: boolean;
  onToggleVisibility: () => void;
  onCopy: () => void;
  onRegenerate: () => void;
};

export const WebhookSecretInput = ({
  secret,
  showSecret,
  secretCopied,
  onToggleVisibility,
  onCopy,
  onRegenerate,
}: WebhookSecretInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="webhook-secret" className="flex items-center gap-2">
        <Shield className="size-4" />
        Webhook Secret
      </Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id="webhook-secret"
            type={showSecret ? 'text' : 'password'}
            value={secret}
            readOnly
            className="pr-10 font-mono text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={onToggleVisibility}
          >
            {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        </div>
        <Button type="button" variant="outline" size="icon" onClick={onCopy} title="Copy secret">
          <Copy className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onRegenerate}
          title="Regenerate secret"
        >
          <RefreshCw className="size-4" />
        </Button>
      </div>
      {secretCopied && <p className="text-xs text-green-600">Secret copied to clipboard!</p>}
      <p className="text-xs text-muted-foreground">
        Use this secret to verify that webhook requests are coming from Templify
      </p>
    </div>
  );
};
