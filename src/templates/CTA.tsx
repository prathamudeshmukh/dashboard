import { useTranslations } from 'next-intl';

import { Section } from '@/features/landing/Section';
import WaitlistForm from '@/features/landing/WaitListForm';

export const CTA = () => {
  const t = useTranslations('CTA');

  return (
    <Section className="w-full bg-primary py-12 text-primary-foreground md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{t('title')}</h2>
            <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              <strong>{t('description')}</strong>
            </p>
          </div>

          <div className="flex items-center justify-center ">
            <div className="w-full space-y-2">
              <WaitlistForm />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
