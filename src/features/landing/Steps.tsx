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
  const observerRef = useRef<IntersectionObserver | null>(null);

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
    <section id="how-it-works" className="bg-primary py-20 text-secondary">
      <div className="container px-5 md:px-0">
        <div className="mb-12 flex flex-col items-center justify-between md:flex-row md:items-start">
          <h2 className="text-4xl font-semibold tracking-tight xl:text-6xl">
            How Templify Works in
            <br />
            5 Simple Steps
          </h2>
          <Button variant="outline" className="mt-8 flex flex-col items-end rounded-full border-black bg-secondary text-lg font-normal text-primary hover:bg-secondary">Build your template</Button>
        </div>

        <div className="mt-16 grid md:grid-cols-4 md:gap-32">

          <StepNavigation steps={steps} activeStep={activeStep} onStepClick={handleStepClick} />

          <div className="col-span-3 space-y-16 md:space-y-32">
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
    </section>
  );
}
