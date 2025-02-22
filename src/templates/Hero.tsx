import { CircleCheckBig } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { buttonVariants } from '@/components/ui/buttonVariants';
import { CenteredHero } from '@/features/landing/CenteredHero';
import { Section } from '@/features/landing/Section';

export const Hero = () => {
  const t = useTranslations('Hero');

  return (
    <Section className="py-36">
      <CenteredHero
        title={t.rich('title', {
          important: chunks => (
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {chunks}
            </span>
          ),
        })}
        description={(
          <div className="flex items-center justify-center">
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-2">
                <CircleCheckBig className="text-purple-500" />
                <span>{t('description1')}</span>
              </li>
              <li className="flex items-center gap-2">
                <CircleCheckBig className="text-purple-500" />
                <span>{t('description2')}</span>
              </li>
              <li className="flex items-center gap-2">
                <CircleCheckBig className="text-purple-500" />
                <span>{t('description3')}</span>
              </li>
            </ul>
          </div>
        )}
        buttons={(
          <>
            <a
              className={buttonVariants({ size: 'lg' })}
              href="https://github.com/ixartz/SaaS-Boilerplate"
            >
              {t('primary_button')}
            </a>
          </>
        )}
      />
    </Section>
  );
};
