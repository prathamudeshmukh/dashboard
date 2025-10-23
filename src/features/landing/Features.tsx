'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { FeatureAccordionItem } from '@/components/landing/FeatureAccordionItem';
import { Accordion } from '@/components/ui/accordion';
import { useFeatures } from '@/hooks/UseFeatures';

export default function Features() {
  const t = useTranslations('Features');
  const features = useFeatures();

  // Track the currently active feature
  const [activeFeature, setActiveFeature] = useState<string | null>(features[0]?.id || null);

  // Get the current feature's image (fallback to default)
  const activeImage
    = features.find(f => f.id === activeFeature) ? `/images/features/${activeFeature}.png` : '/images/dashboard.png';

  // ✅ Preload all feature images for smoother transitions
  useEffect(() => {
    features.forEach((feature) => {
      const img = new window.Image();
      img.src = `/images/features/${feature.id}.png`;
    });

    // Optionally preload fallback image too
    const fallback = new window.Image();
    fallback.src = '/images/dashboard.png';
  }, [features]);

  return (
    <section id="features" className="bg-white py-20">
      <div className="container px-5 md:px-0">
        <h2 className="text-center text-4xl font-bold md:text-5xl lg:text-6xl lg:font-semibold">{t('title')}</h2>
        <p className="mx-auto mb-6 mt-4 max-w-3xl text-center font-normal text-gray-600">{t('subtitle')}</p>

        <div className="mx-auto mt-12 grid gap-10 md:grid-cols-2 md:items-stretch">
          <div>
            <Accordion type="single" onValueChange={(value: string) => (setActiveFeature(value))} collapsible>
              {features.map(feature => (
                <FeatureAccordionItem
                  key={feature.id}
                  title={feature.title}
                  description={feature.content}
                  points={feature.points}
                  value={feature.id}
                />
              ))}
            </Accordion>

          </div>
          <div className="relative size-full overflow-hidden rounded-xl bg-templify-lightgray">
            <Image
              key={activeImage}
              src={activeImage}
              alt="Features"
              fill
              className="object-contain object-center opacity-0 transition-opacity duration-300 data-[loaded=true]:opacity-100"
              onLoadingComplete={img => img.setAttribute('data-loaded', 'true')}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
