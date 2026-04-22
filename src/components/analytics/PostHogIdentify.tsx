'use client';

import { useUser } from '@clerk/nextjs';
import posthog from 'posthog-js';
import { useEffect } from 'react';

export function PostHogIdentify() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) {
      return;
    }
    try {
      posthog.identify(user.id, {
        email: user.emailAddresses[0]?.emailAddress,
        name: user.fullName ?? undefined,
      });
    } catch {
      // posthog.identify failing must not break the dashboard
    }
  }, [user, isLoaded]);

  return null;
}
