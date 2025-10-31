'use client';

import { useEffect } from 'react';

import { trackEvent } from '@/libs/analytics/trackEvent';

export const PageViewTracker = () => {
  useEffect(() => {
    // Only run on first mount
    const referrer = document.referrer || 'direct';
    const params = new URLSearchParams(window.location.search);
    const utm_source = params.get('utm_source') || undefined;
    const device_type = /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
    const country = 'unknown';

    trackEvent('landing_page_viewed', {
      referrer,
      utm_source,
      device_type,
      country,
    });
  }, []);

  return null;
};
