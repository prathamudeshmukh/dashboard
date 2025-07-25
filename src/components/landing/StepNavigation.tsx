'use client';

type StepNavigationProps = {
  steps: { id: string; title: string }[];
  activeStep: string;
  onStepClick: (stepId: string) => void;
};

export default function StepNavigation({ steps, activeStep, onStepClick }: StepNavigationProps) {
  return (
    <div className="hidden space-y-4 md:sticky md:top-24 md:block md:self-start">
      {steps.map(step => (
        <button
          key={step.id}
          className={`w-full text-left transition-colors duration-300 ${activeStep === step.id ? 'text-white' : 'text-white/60 hover:text-white/80'
          }`}
          onClick={() => onStepClick(step.id)}
        >
          <h3 className="text-2xl font-normal">{step.title}</h3>
        </button>
      ))}
    </div>
  );
}
