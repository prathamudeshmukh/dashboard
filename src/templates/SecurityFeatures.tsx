import { Code, Lock, Server, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FeaturesCard } from '@/features/landing/FeaturesCard';
import { Section } from '@/features/landing/Section';

export const SecurityFeatures = () => {
  const t = useTranslations('SecurityFeatures');

  return (
    <div id="security">
      <Section
        className="w-full bg-secondary py-12 md:py-24 lg:py-32"
        description={t('description')}
        icon={Lock}
        title={t('title')}
      >
        <div className="container px-4 md:px-6">
          <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
            <FeaturesCard
              title={t('feature1')}
              description={t('feature1_description')}
              icon={<Lock className="size-8 text-secondary" />}
            />
            <FeaturesCard
              title={t('feature2')}
              description={t('feature2_description')}
              icon={<Server className="size-8 text-secondary" />}
            />
            <FeaturesCard
              title={t('feature3')}
              description={t('feature3_description')}
              icon={<Code className="size-8 text-secondary" />}
            />
            <FeaturesCard
              title={t('feature4')}
              description={t('feature4_description')}
              icon={<Zap className="size-8 text-secondary" />}
            />
          </div>
        </div>
      </Section>
    </div>
  );
};
