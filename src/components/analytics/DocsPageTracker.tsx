'use client';

import { useEffect, useRef } from 'react';

import { trackEvent } from '@/libs/analytics/trackEvent';

export const DocsPageTracker = () => {
  const startTime = useRef<number>(Date.now());
  const sectionStartTimes = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    // Track initial page view
    const referrer = document.referrer || 'direct';
    const params = new URLSearchParams(window.location.search);
    const utm_source = params.get('utm_source') || undefined;
    const device_type = /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
    const country = 'unknown';

    trackEvent('docs_page_viewed', {
      referrer,
      utm_source,
      device_type,
      country,
    });

    // Set up intersection observer for section tracking
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.id;
          const sectionName = entry.target.querySelector('h2')?.textContent || sectionId;

          if (entry.isIntersecting) {
            // Section came into view
            sectionStartTimes.current.set(sectionId, Date.now());
            trackEvent('docs_section_viewed', {
              section_name: sectionName,
              section_id: sectionId,
            });
          } else {
            // Section went out of view - track time spent
            const startTime = sectionStartTimes.current.get(sectionId);
            if (startTime) {
              const timeInSection = Date.now() - startTime;
              trackEvent('docs_section_viewed', {
                section_name: sectionName,
                section_id: sectionId,
                time_in_section: timeInSection,
              });
              sectionStartTimes.current.delete(sectionId);
            }
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of section is visible
        rootMargin: '-10% 0px -10% 0px', // Only trigger when section is well into view
      },
    );

    // Observe all sections with IDs
    const sections = document.querySelectorAll('[id]');
    sections.forEach((section) => {
      if (section.id && section.id !== 'introduction') {
        observer.observe(section);
      }
    });

    // Track time on page when user leaves
    const handleBeforeUnload = () => {
      const timeOnPage = Date.now() - startTime.current;
      trackEvent('docs_page_viewed', {
        referrer,
        utm_source,
        device_type,
        country,
        time_on_page: timeOnPage,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      observer.disconnect();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
};
