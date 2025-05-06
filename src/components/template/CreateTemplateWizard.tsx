'use client';

import { useState } from 'react';

import { useTemplateStore } from '@/libs/store/TemplateStore';

import { Wizard } from '../Wizard';
import { WizardNavigation } from '../WizardNavigation';
import TemplateCreationMethodSelector from './steps/TemplateCreationMethodSelector';
import TemplateDetailsStep from './steps/TemplateDetailsStep';
import TemplateEditorStep from './steps/TemplateEditorStep';
import TemplateSourceStep from './steps/TemplateSourceStep';

export enum CreationMethodEnum {
  EXTRACT_FROM_PDF = 'Extract From PDF',
  TEMPLATE_GALLERY = 'Template Gallery',
  NEW_TEMPLATE = 'New Template',
}

export default function CreateTemplateWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [creationMethod, setCreationMethod] = useState(CreationMethodEnum.EXTRACT_FROM_PDF);
  const { templateName, templateDescription, htmlContent, setTemplateName, setTemplateDescription } = useTemplateStore();
  const handleNext = () => setCurrentStep(prev => prev + 1);
  const handlePrevious = () => setCurrentStep(prev => prev - 1);

  const steps = [
    { id: 'method', title: 'Choose Method' },
    {
      id: 'source',
      title: creationMethod === CreationMethodEnum.EXTRACT_FROM_PDF ? 'Upload PDF' : 'Select Template',
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
      case 3:
        return (
          <TemplateEditorStep />
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
      case 3:
        return (!htmlContent);
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
