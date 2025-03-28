import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { HeroSection } from '@/features/landing/HeroSection';

export const Hero = () => {
  const t = useTranslations('Hero');

  return (
    <HeroSection
      title={t.rich('title', {
        important: chunks => (
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {chunks}
          </span>
        ),
      })}
      subtitle={t.rich('subtitle', {
        important: chunks => (
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text font-bold text-transparent">
            {chunks}
          </span>
        ),
      })}
      description={(
        <>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-primary" />
            <p className="font-medium">{t('description1')}</p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-primary" />
            <p className="font-medium">{t('description2')}</p>
          </div>
        </>
      )}
      button={(
        <Link href="/sign-up">
          <Button size="lg" className="gap-1">
            {t('primary_button')}
          </Button>
        </Link>
      )}
    />
  );
};
