import {
  Blocks,
  BookmarkCheck,
  Mail,
  Pencil,
  SquareMousePointer,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Background } from '@/components/Background';
import { FeatureCard } from '@/features/landing/FeatureCard';
import { Section } from '@/features/landing/Section';

export const Working = () => {
  const t = useTranslations('Working');

  return (
    <Background>
      <Section
        subtitle={t('section_subtitle')}
        title={t('section_title')}
        description={t('section_description')}
      >
        <div className="grid grid-cols-1 gap-x-3 gap-y-8 md:grid-cols-3">

          <FeatureCard
            icon={(<Mail className="stroke-primary-foreground stroke-2" />)}
            title={t('step1_title')}
          >
            {t('step1_description')}
          </FeatureCard>

          <FeatureCard
            icon={(<Pencil className="stroke-primary-foreground stroke-2" />)}
            title={t('step2_title')}
          >
            <p className="mt-2">{t('step2_description.description_1')}</p>
            <p className="mt-2">{t('step2_description.description_2')}</p>
          </FeatureCard>

          <FeatureCard
            icon={(<SquareMousePointer className="stroke-primary-foreground stroke-2" />)}
            title={t('step3_title')}
          >
            {t('step3_description')}
          </FeatureCard>

          <FeatureCard
            icon={(<Blocks className="stroke-primary-foreground stroke-2" />)}
            title={t('step4_title')}
          >
            {t('step4_description')}
          </FeatureCard>

          <FeatureCard
            icon={(<BookmarkCheck className="stroke-primary-foreground stroke-2" />)}
            title={t('step5_title')}
          >
            {t('step5_description')}
          </FeatureCard>

        </div>
      </Section>
    </Background>
  );
};
