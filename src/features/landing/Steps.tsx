'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import StepContent from '@/components/landing/StepContent';
import StepNavigation from '@/components/landing/StepNavigation';
import { Button } from '@/components/ui/button';

export default function Steps() {
  const t = useTranslations('Steps');
  const [activeStep, setActiveStep] = useState(t('step1'));
  const stepRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const sectionRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      id: t('step1'),
      title: t('step1_title'),
      description: t('step1_description'),
      image: '/images/login-ui.png',
      imageAlt: t('step1_imageAlt'),
    },
    {
      id: t('step2'),
      title: t('step2_title'),
      description: t('step2_description'),
      image: '/images/dashboard.png',
      imageAlt: t('step2_imageAlt'),
    },
    {
      id: t('step3'),
      title: t('step3_title'),
      description: t('step3_description'),
      image: '/images/payment-form.png',
      imageAlt: t('step3_imageAlt'),
    },
    {
      id: t('step4'),
      title: t('step4_title'),
      description: t('step4_description'),
      image: '/images/dashboard.png',
      imageAlt: t('step4_imageAlt'),
    },
    {
      id: t('step5'),
      title: t('step5_title'),
      description: t('step5_description'),
      image: '/images/payment-form.png',
      imageAlt: t('step5_imageAlt'),
    },
  ];

  useEffect(() => {
    const options = {
      root: null,
      threshold: 0.5,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace('step-', '');
          setActiveStep(id);
        }
      });
    }, options);

    Object.values(stepRefs.current).forEach((ref) => {
      if (ref) {
        observerRef.current?.observe(ref);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const handleStepClick = (stepId: string) => {
    setActiveStep(stepId);
    const stepElement = stepRefs.current[stepId];
    if (stepElement) {
      stepElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="how-it-works" ref={sectionRef} className="relative bg-primary py-20 text-secondary">
      <div className="container mx-auto  px-4">
        <div className="mx-auto max-w-6xl">
          <div className="z-[5] py-8 md:sticky md:top-16">
            <div className="grid grid-cols-1 md:grid-cols-[40%_60%]">
              <div className="flex items-center justify-between bg-primary">
                <h2 className="text-left text-4xl font-semibold tracking-tight xl:text-6xl">
                  How Templify Works in
                  <br className="hidden md:block" />
                  {' '}
                  5 Simple Steps
                </h2>
              </div>
              <div className="mt-6 flex justify-end md:mt-0">
                <Button variant="outline" className="mt-8 flex flex-col items-end rounded-full border-black bg-secondary text-lg font-normal text-primary hover:bg-secondary">Build your template</Button>
              </div>
            </div>
          </div>

          <div ref={contentRef} className="mt-16 grid grid-cols-1 gap-8 pt-16 md:grid-cols-[40%_60%]">
            <StepNavigation steps={steps} activeStep={activeStep} onStepClick={handleStepClick} />
            <div className="space-y-32">
              {steps.map(step => (
                <StepContent
                  key={step.id}
                  id={step.id}
                  title={step.title}
                  description={step.description}
                  image={step.image}
                  imageAlt={step.imageAlt}
                  innerRef={el => (stepRefs.current[step.id] = el)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
