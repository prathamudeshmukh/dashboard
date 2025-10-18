import posthog from 'posthog-js';

import type { EventPayloads, LandingPageEvents } from '@/types/Posthog/Events';

// Track Function
export const trackEvent = <E extends LandingPageEvents>(
  event: E,
  properties: EventPayloads[E],
) => {
  if (typeof window === 'undefined') {
    return;
  }
  posthog.capture(event, properties);
};
