import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type WebhookUrlInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export const WebhookUrlInput = ({ value, onChange }: WebhookUrlInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="webhook-url">Webhook URL</Label>
      <Input
        id="webhook-url"
        type="url"
        placeholder="https://your-domain.com/webhooks/templify"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="font-mono text-sm"
      />
      <p className="text-xs text-muted-foreground">Enter the URL where you want to receive webhook notifications</p>
    </div>
  );
};
