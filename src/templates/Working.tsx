import {
  Code,
  FileText,
  LayoutTemplate,
  Server,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Section } from '@/features/landing/Section';
import { StepCard } from '@/features/landing/StepCard';

export const Working = () => {
  const t = useTranslations('Working');

  // Custom Google icon since it's not in lucide-react
  function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        <path d="M17.8 12.2H12v3.6h3.3c-.3 1.3-1.4 2.4-3.3 2.4-2 0-3.6-1.6-3.6-3.6s1.6-3.6 3.6-3.6c.9 0 1.7.3 2.3.8l2.7-2.7C15.9 8 14.1 7.2 12 7.2c-3.9 0-7 3.1-7 7s3.1 7 7 7c4 0 6.8-2.8 6.8-6.8 0-.5-.1-1-.2-1.5z" />
      </svg>
    );
  }

  return (
    <div id="how-it-works">
      <Section
        className="w-full bg-muted py-12 md:py-24 lg:py-32"
        title="Step-by-Step Breakdown"
        subtitle="How it Works"
        description="Seamlessly integrates with any SaaS application in minutes."
      >

        <div className="container px-4 md:px-6">
          <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 md:grid-cols-5 md:gap-12">

            <StepCard
              stepNumber={1}
              title={t('step1_title')}
              description={(
                <>
                  {t('step1_description')}
                </>
              )}
              icon={<GoogleIcon className="size-8 text-muted-foreground" />}
            />

            <StepCard
              stepNumber={2}
              title={t('step2_title')}
              description={(
                <>
                  <span>{t('step2_description.description_1')}</span>
                  <br />
                  <span>{t('step2_description.description_2')}</span>

                </>
              )}
              icon={<LayoutTemplate className="size-8 text-muted-foreground" />}
            />

            <StepCard
              stepNumber={3}
              title={t('step3_title')}
              description={(
                <>
                  {t('step3_description')}
                </>
              )}
              icon={<Code className="size-8 text-muted-foreground" />}
            />

            <StepCard
              stepNumber={4}
              title={t('step4_title')}
              description={(
                <>
                  {t('step4_description')}
                </>
              )}
              icon={<Server className="size-8 text-muted-foreground" />}
            />

            <StepCard
              stepNumber={5}
              title={t('step5_title')}
              description={(
                <>
                  {t('step5_description')}
                </>
              )}
              icon={<FileText className="size-8 text-muted-foreground" />}
            />

          </div>
        </div>
      </Section>
    </div>
  );
};
