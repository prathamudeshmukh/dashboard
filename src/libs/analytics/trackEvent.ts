import posthog from 'posthog-js';

import type { AppEvents, EventPayloads } from '@/types/Posthog/Events';

// Track Function
export const trackEvent = <E extends AppEvents >(
  event: E,
  properties: EventPayloads[E],
) => {
  if (typeof window === 'undefined') {
    return;
  }
  posthog.capture(event, properties);
};
