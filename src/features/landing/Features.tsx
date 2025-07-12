'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { FeatureAccordionItem } from '@/components/landing/FeatureAccordionItem';
import { Accordion } from '@/components/ui/accordion';
import { useFeatures } from '@/hooks/UseFeatures';

export default function Features() {
  const t = useTranslations('Features');
  const features = useFeatures();

  return (
    <section id="features" className="bg-white py-20">
      <div className="container px-5 md:px-0">
        <h2 className="text-center text-4xl font-bold md:text-5xl lg:text-6xl lg:font-semibold">{t('title')}</h2>
        <p className="mx-auto mb-6 mt-4 max-w-3xl text-center font-normal text-gray-600">{t('subtitle')}</p>

        <div className="mx-auto mt-12 grid gap-10 md:grid-cols-2">
          <div>
            <Accordion type="single" collapsible>
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

          <div className="flex items-center justify-center rounded-xl bg-templify-lightgray p-8">
            <Image
              src="/images/payment-form.png"
              alt="Payment Form Example"
              width={500}
              height={400}
              className="w-full max-w-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
