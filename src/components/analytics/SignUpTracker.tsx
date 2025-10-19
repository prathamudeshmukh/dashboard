'use client';

import { useEffect } from 'react';

import { trackEvent } from '@/libs/analytics/trackEvent';

export function SignupTracker() {
  useEffect(() => {
    trackEvent('signup_started', {
      referrer: document.referrer || 'direct',
      utm_source: new URLSearchParams(window.location.search).get('utm_source') || undefined,
      device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    });
  }, []);

  return null;
}
