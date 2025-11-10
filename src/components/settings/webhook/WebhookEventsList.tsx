import { CheckCircle2 } from 'lucide-react';

import { Label } from '@/components/ui/label';

import type { WebhookEvent } from '../../../features/dashboard/settings/constants';

type WebhookEventsListProps = {
  events: WebhookEvent[];
};

export const WebhookEventsList = ({ events }: WebhookEventsListProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base">Subscribed Events</Label>
        <p className="mt-1 text-sm text-muted-foreground">
          All events are automatically subscribed and will trigger webhook notifications
        </p>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {events.map(event => (
          <div
            key={event.id}
            className="inline-flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-1.5"
            title={event.description}
          >
            <CheckCircle2 className="size-4 shrink-0 text-green-600" />
            <span className="text-sm font-medium text-green-900">{event.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
