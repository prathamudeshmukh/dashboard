import {
  ChartNetwork,
  Database,
  MousePointer,
  RefreshCw,
  Shield,
  Zap,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { FeaturesCard } from '@/features/landing/FeaturesCard';
import { Section } from '@/features/landing/Section';

export const KeyFeatures = () => {
  const t = useTranslations('KeyFeatures');
  return (
    <div id="features">
      <Section
        className="w-full bg-background py-12 md:py-24 lg:py-32"
        title={t('section_title')}
        subtitle={t('section_subtitle')}
        icon={Zap}
      >
        <div className="container px-4 md:px-6">
          <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">

            <FeaturesCard
              icon={<MousePointer className="size-8 text-white" />}
              title={t('feature1_title')}
              description={t('feature1_description')}
            />
            <FeaturesCard
              icon={<RefreshCw className="size-8 text-white" />}
              title={t('feature2_title')}
              description={t('feature2_description')}
            />
            <FeaturesCard
              icon={<Database className="size-8 text-white" />}
              title={t('feature3_title')}
              description={t('feature3_description')}
            />
            <FeaturesCard
              icon={<Zap className="size-8 text-white" />}
              title={t('feature4_title')}
              description={t('feature4_description')}
            />
            <FeaturesCard
              icon={<Shield className="size-8 text-white" />}
              title={t('feature5_title')}
              description={t('feature5_description')}
            />
            <FeaturesCard
              icon={<ChartNetwork className="size-8 text-white" />}
              title={t('feature6_title')}
              description={t('feature6_description')}
            />
          </div>
          <div className="flex items-center justify-center">
            <CardContent className="p-6">
              <Button size="lg" className="w-full gap-1">
                {t('primary_button')}
              </Button>
            </CardContent>
          </div>
        </div>
      </Section>
    </div>
  );
};
