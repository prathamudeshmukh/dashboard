'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    autocapture: false,
    loaded() {
        if (process.env.NODE_ENV !== 'production') {
          posthog.opt_out_capturing();
        }
      },
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com/i/v0/e/',
      person_profiles: 'always', // or 'always' to create profiles for anonymous users as well
      defaults: '2025-05-24',
      autocapture: true,
      capture_pageview: false,
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  );
}
