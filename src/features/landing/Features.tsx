'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { FeatureAccordionItem } from '@/components/landing/FeatureAccordionItem';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

export default function Features() {
  const t = useTranslations('Features');
  const features = [
    {
      id: t('id_1'),
      title: t('title_1'),
      content: t('content_1'),
    },
    {
      id: t('id_2'),
      title: t('title_2'),
      content: t('content_2'),
    },
    {
      id: t('id_3'),
      title: t('title_3'),
      content: t('content_3'),
    },
    {
      id: t('id_4'),
      title: t('title_4'),
      content: t('content_4'),
    },
    {
      id: t('id_5'),
      title: t('title_5'),
      content: t('content_5'),
    },
    {
      id: t('id_6'),
      title: t('title_6'),
      content: t('content_6'),
    },
  ];

  return (
    <section id="features" className="bg-white py-20">
      <div className="container px-5 md:px-0">
        <h2 className="text-center text-4xl font-bold md:text-5xl lg:text-6xl lg:font-semibold">{t('title')}</h2>
        <p className="mx-auto mb-6 mt-4 max-w-3xl text-center font-normal text-gray-600">{t('subtitle')}</p>

        <div className="mb-12 flex justify-center">
          <Button className="rounded-full bg-primary text-lg font-normal hover:bg-primary">{t('cta')}</Button>
        </div>

        <div className="mx-auto grid gap-10 md:grid-cols-2">
          <div>
            <Accordion type="single" collapsible>
              {features.map(feature => (
                <FeatureAccordionItem
                  key={feature.id}
                  title={feature.title}
                  description={feature.content}
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
