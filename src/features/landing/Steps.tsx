'use client';

import { useEffect, useRef, useState } from 'react';

import StepContent from '@/components/landing/StepContent';
import StepNavigation from '@/components/landing/StepNavigation';
import { Button } from '@/components/ui/button';
import { useSteps } from '@/hooks/UseStep';

export default function Steps() {
  const steps = useSteps();
  const [activeStep, setActiveStep] = useState(steps[0]?.id);
  const stepRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

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
            How Templify Works — From
            <br />
            Idea to PDF in Minutes
          </h2>
          <Button variant="outline" className="mt-8 flex flex-col items-end rounded-full border-black bg-secondary text-lg font-normal text-primary hover:bg-secondary">Build your template</Button>
        </div>

        <div className="mt-16 grid md:grid-cols-4 md:gap-32">

          <StepNavigation steps={steps} activeStep={activeStep as string} onStepClick={handleStepClick} />

          <div className="col-span-3 space-y-16 md:space-y-32">
            {steps.map(step => (
              <StepContent
                key={step.id}
                content={step}
                innerRef={el => (stepRefs.current[step.id] = el)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
