'use client';

import { Check, ChevronRight } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export type WizardStep = {
  id: string;
  title: string;
  description?: string;
  isCompleted?: boolean;
  isActive?: boolean;
};

type WizardProps = {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
};

export function Wizard({ steps, currentStep, onStepClick, className }: WizardProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => onStepClick && onStepClick(index)}
                disabled={!onStepClick}
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                  index < currentStep
                    ? 'border-primary bg-primary text-primary-foreground'
                    : index === currentStep
                      ? 'border-primary bg-background text-primary'
                      : 'border-muted-foreground/25 bg-background text-muted-foreground',
                  onStepClick && 'cursor-pointer hover:bg-muted',
                )}
              >
                {index < currentStep
                  ? (
                      <Check className="size-5" />
                    )
                  : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
              </button>
              <span
                className={cn(
                  'mt-2 text-xs font-medium',
                  index === currentStep ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {step.title}
              </span>
            </div>

            {/* Connector line between steps */}
            {index < steps.length - 1 && (
              <div
                className={cn('h-[2px] flex-1 mx-2', index < currentStep ? 'bg-primary' : 'bg-muted-foreground/25')}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export type WizardContentProps = {
  step: number;
  currentStep: number;
  children: React.ReactNode;
};

export function WizardContent({ step, currentStep, children }: WizardContentProps) {
  if (step !== currentStep) {
    return null;
  }
  return <div className="mt-8">{children}</div>;
}

export type WizardNavigationProps = {
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onComplete?: () => void;
  disableNext?: boolean;
  disablePrevious?: boolean;
  className?: string;
  nextLabel?: string;
  previousLabel?: string;
  completeLabel?: string;
};

export function WizardNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onComplete,
  disableNext,
  disablePrevious,
  className,
  nextLabel = 'Next',
  previousLabel = 'Back',
  completeLabel = 'Complete',
}: WizardNavigationProps) {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className={cn('flex justify-between mt-8', className)}>
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentStep === 0 || disablePrevious}
        className={cn(
          'px-4 py-2 text-sm font-medium rounded-md',
          currentStep === 0 || disablePrevious
            ? 'text-muted-foreground cursor-not-allowed'
            : 'text-primary hover:bg-primary/10',
        )}
      >
        {previousLabel}
      </button>
      <button
        type="button"
        onClick={isLastStep ? onComplete : onNext}
        disabled={disableNext}
        className={cn(
          'px-4 py-2 text-sm font-medium rounded-md flex items-center gap-1',
          disableNext
            ? 'bg-primary/50 text-primary-foreground cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:bg-primary/90',
        )}
      >
        {isLastStep ? completeLabel : nextLabel}
        {!isLastStep && <ChevronRight className="size-4" />}
      </button>
    </div>
  );
}
