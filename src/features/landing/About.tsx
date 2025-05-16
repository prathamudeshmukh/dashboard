'use client';

import { Icon } from '@iconify-icon/react';
import { useTranslations } from 'next-intl';

import { AboutCard } from '@/components/landing/AboutCard';

export default function About() {
  const t = useTranslations('SecurityFeatures');
  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-16 text-center text-4xl font-bold md:text-5xl">
          Designed to Do More,
          <br />
          Differently
        </h2>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <AboutCard
            icon={<Icon icon="material-symbols-light:lock-outline" width="50" height="50" className="bg-templify-lightgray" />}
            title={t('feature1')}
            description={t('feature1_description')}
          />
          <AboutCard
            icon={<Icon icon="hugeicons:security-check" width="50" height="50" className="bg-templify-lightgray" />}
            title={t('feature2')}
            description={t('feature2_description')}
          />
          <AboutCard
            icon={<Icon icon="material-symbols-light:support-agent-outline-rounded" width="50" height="50" className="bg-templify-lightgray" />}
            title={t('feature3')}
            description={t('feature3_description')}
          />
          <AboutCard
            icon={<Icon icon="solar:scale-linear" width="50" height="50" className="bg-templify-lightgray" />}
            title={t('feature4')}
            description={t('feature4_description')}
          />
        </div>
      </div>
    </section>
  );
}
