import { ChevronRight, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { SaveStatusEnum } from '@/types/Enum';
import type { WizardNavigationProps } from '@/types/Wizard';

import { Button } from './ui/button';

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
  completeLabel = 'Submit & Publish',
  saveStatus,
}: WizardNavigationProps) {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className={cn('flex justify-between mt-8', className)}>
      <Button
        variant="outline"
        type="button"
        onClick={onPrevious}
        disabled={currentStep === 0 || disablePrevious}
        className={cn(
          'text-xl px-4 py-2 rounded-full',
          currentStep === 0 || disablePrevious
            ? 'text-muted-foreground cursor-not-allowed'
            : 'text-primary hover:bg-primary/10',
        )}
      >
        {previousLabel}
      </Button>
      <Button
        type="button"
        onClick={isLastStep ? onComplete : onNext}
        disabled={disableNext}
        className={cn(
          'text-xl px-4 py-2 rounded-full flex gap-1',
          disableNext
            ? 'bg-primary/50 text-primary-foreground cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:bg-primary/90',
        )}
      >
        {isLastStep ? completeLabel : nextLabel}
        {!isLastStep ? <ChevronRight className="size-4" /> : saveStatus === SaveStatusEnum.SAVING && <Loader2 className="animate-spin" />}
      </Button>
    </div>
  );
}
