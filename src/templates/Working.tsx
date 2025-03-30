'use client';

import useEmblaCarousel from 'embla-carousel-react';
import {
  Code,
  FileText,
  LayoutTemplate,
  Server,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useCallback, useState } from 'react';

import { Section } from '@/features/landing/Section';
import { StepCard, type StepCardProps } from '@/features/landing/StepCard';

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

  const steps: StepCardProps[] = [
    {
      title: t('step1_title'),
      description: t('step1_description'),
      icon: <GoogleIcon className="size-8 text-secondary" />,
    },
    {
      title: t('step2_title'),
      description:
        <>
          <span>{t('step2_description.description_1')}</span>
          <br />
          <br />
          <span>{t('step2_description.description_2')}</span>

        </>,
      icon: <LayoutTemplate className="size-8 text-secondary" />,
    },
    {
      title: t('step3_title'),
      description: t('step3_description'),
      icon: <Code className="size-8 text-secondary" />,
    },
    {
      title: t('step4_title'),
      description: t('step4_description'),
      icon: <Server className="size-8 text-secondary" />,
    },
    {
      title: t('step5_title'),
      description: t('step5_description'),
      icon: <FileText className="size-8 text-secondary" />,
    },
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
  });

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) {
        return;
      }
      emblaApi.scrollTo(index);
      setSelectedIndex(index);
    },
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) {
      return;
    }
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div id="how-it-works">
      <Section
        className="w-full bg-muted py-12 md:py-24 lg:py-32"
        title="Step-By-Step Breakdown"
        description="Seamlessly integrates with any SaaS application in minutes."
      >

        <div className="relative">

          <div className="mb-8 flex justify-center gap-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`size-10 rounded-full border-2 font-medium transition-all
              ${selectedIndex === index
                ? 'border-indigo-500 bg-indigo-500 text-white'
                : 'border-gray-300 bg-white text-gray-500 hover:border-indigo-300'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Carousel */}
          <div ref={emblaRef} className="overflow-hidden xl:overflow-visible 2xl:overflow-visible">
            <div className="flex touch-pan-y items-stretch">
              {steps.map((step, index) => (
                <div key={index} className="relative flex-[0_0_75%] px-4 sm:flex-[0_0_50%] md:flex-[0_0_30%] lg:flex-[0_0_25%]">
                  <StepCard
                    title={step.title}
                    description={step.description}
                    icon={step.icon}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};
