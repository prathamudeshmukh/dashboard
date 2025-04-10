'use client';

import { useState } from 'react';

import { Wizard, WizardNavigation } from '../Wizard';
import WizardStepSelector from './steps/WizardStepSelector';

export default function CreateTemplateWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [creationMethod, setCreationMethod] = useState<'pdf' | 'gallery' | null>('pdf');

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
          <WizardStepSelector
            creationMethod={creationMethod}
            setCreationMethod={setCreationMethod}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-5xl bg-white p-6">
      <div className="mb-8 flex items-center">
        <div>
          <h1 className="text-2xl font-bold">Create New Template</h1>
          <p className="text-muted-foreground">Follow the steps to create your template</p>
        </div>
      </div>

      {/* Wizard progress */}
      <Wizard
        steps={steps}
        currentStep={currentStep}
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
        />
      </div>
    </div>
  );
}
