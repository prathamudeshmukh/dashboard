'use client';

import { useState } from 'react';

import { useTemplateStore } from '@/libs/store/TemplateStore';

import { Wizard } from '../Wizard';
import { WizardNavigation } from '../WizardNavigation';
import TemplateCreationMethodSelector from './steps/TemplateCreationMethodSelector';
import TemplateDetailsStep from './steps/TemplateDetailsStep';
import TemplateSourceStep from './steps/TemplateSourceStep';

export default function CreateTemplateWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [creationMethod, setCreationMethod] = useState<'pdf' | 'gallery' | null>('pdf');
  const { templateName, templateDescription, htmlContent, setTemplateName, setTemplateDescription } = useTemplateStore();
  const handleNext = () => setCurrentStep(prev => prev + 1);
  const handlePrevious = () => setCurrentStep(prev => prev - 1);

  const steps = [
    { id: 'method', title: 'Choose Method' },
    {
      id: 'source',
      title: creationMethod === 'pdf' ? 'Upload PDF' : 'Select Template',
    },
    { id: 'details', title: 'Template Details' },
    { id: 'editor', title: 'Edit Template' },
    { id: 'review', title: 'Review & Save' },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <TemplateCreationMethodSelector
            creationMethod={creationMethod}
            setCreationMethod={setCreationMethod}
          />
        );
      case 1:
        return (
          <TemplateSourceStep
            creationMethod={creationMethod!}
          />
        );
      case 2:
        return (
          <TemplateDetailsStep
            templateName={templateName}
            setTemplateName={setTemplateName}
            templateDescription={templateDescription}
            setTemplateDescription={setTemplateDescription}
          />
        );
      default:
        return null;
    }
  };

  // Check if next button should be disabled
  const isNextDisabled = () => {
    switch (currentStep) {
      case 0:
        return !creationMethod;
      case 1:
        return !htmlContent;
      case 2:
        return (!templateName || !templateDescription);
      default:
        return false;
    }
  };

  return (
    <div className=" px-10 py-12">

      {/* Wizard progress */}
      <Wizard
        steps={steps}
        currentStep={currentStep}
        onStepClick={(index) => {
          // Only allow clicking on completed steps or the current step + 1
          if (index <= currentStep || (index === currentStep + 1 && !isNextDisabled())) {
            setCurrentStep(index);
          }
        }}
        className="mb-8"
      />

      {/* Navigation */}
      <div className="flex flex-col space-y-6">
        {renderStep()}
        <WizardNavigation
          totalSteps={5}
          currentStep={currentStep}
          onNext={handleNext}
          onPrevious={handlePrevious}
          disableNext={isNextDisabled()}
        />
      </div>
    </div>
  );
}
