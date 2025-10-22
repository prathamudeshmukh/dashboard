'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

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
          <div className="relative size-full overflow-hidden rounded-xl">
            <Image
              key={activeImage}
              src={activeImage}
              alt="Features"
              fill
              className="object-contain object-center transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
