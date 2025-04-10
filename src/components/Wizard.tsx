'use client';

import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import type { WizardContentProps, WizardProps } from '@/types/Wizard';

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

export function WizardContent({ step, currentStep, children }: WizardContentProps) {
  if (step !== currentStep) {
    return null;
  }
  return <div className="mt-8">{children}</div>;
}
