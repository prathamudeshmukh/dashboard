import type { SaveStatusEnum } from './Enum';

export type WizardStep = {
  id: string;
  title: string;
  description?: string;
  isCompleted?: boolean;
  isActive?: boolean;
};

export type WizardProps = {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
};

export type WizardContentProps = {
  step: number;
  currentStep: number;
  children: React.ReactNode;
};

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
  saveStatus?: SaveStatusEnum;
};
