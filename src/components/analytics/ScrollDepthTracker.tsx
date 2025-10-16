'use client';

import { useEffect, useRef } from 'react';

import { trackEvent } from '@/libs/analytics/trackEvent';

export const ScrollDepthTracker = () => {
  const reachedRef = useRef<Set<number>>(new Set()); // Keeps track of which depths are already fired

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      // Depth checkpoints
      const thresholds = [25, 50, 75, 100];

      for (const threshold of thresholds) {
        if (scrollPercent >= threshold && !reachedRef.current.has(threshold)) {
          reachedRef.current.add(threshold);

          trackEvent('scroll_depth_reached', {
            depth_percent: threshold,
            time_to_reach: Math.round(performance.now() / 1000), // seconds since page load
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
};
