import { CircleCheckBig, FileCode2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FeatureCard } from '@/features/landing/FeatureCard';
import { Section } from '@/features/landing/Section';

export const Challenges = () => {
  const t = useTranslations('Challenges');

  return (
    <Section
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <div className="mx-auto mt-5 flex items-center justify-center text-center text-xl text-muted-foreground">
        <FeatureCard
          icon={(<FileCode2 />)}
        >
          <ul className="mt-4 space-y-4">
            <li className="flex items-center gap-2">
              <CircleCheckBig className="text-purple-500" />
              <span>{t('challenge1')}</span>
            </li>
            <li className="flex items-center gap-2">
              <CircleCheckBig className="text-purple-500" />
              <span>{t('challenge2')}</span>
            </li>
            <li className="flex items-center gap-2">
              <CircleCheckBig className="text-purple-500" />
              <span>{t('challenge3')}</span>
            </li>
          </ul>
        </FeatureCard>
      </div>
    </Section>
  );
};
