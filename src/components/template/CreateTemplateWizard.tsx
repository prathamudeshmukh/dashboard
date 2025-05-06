'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { UpsertTemplate } from '@/libs/actions/templates';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import { CreationMethodEnum, SaveStatusEnum } from '@/types/Enum';
import { TemplateType } from '@/types/Template';

import { Wizard } from '../Wizard';
import { WizardNavigation } from '../WizardNavigation';
import TemplateCreationMethodSelector from './steps/TemplateCreationMethodSelector';
import TemplateDetailsStep from './steps/TemplateDetailsStep';
import TemplateEditorStep, { EditorTypeEnum } from './steps/TemplateEditorStep';
import TemplateReviewStep from './steps/TemplateReviewStep';
import TemplateSourceStep from './steps/TemplateSourceStep';

export default function CreateTemplateWizard() {
  const { user } = useUser();
  const router = useRouter();
  const [saveStatus, setSaveStatus] = useState<SaveStatusEnum>(SaveStatusEnum.IDLE);
  const [currentStep, setCurrentStep] = useState(0);
  const { creationMethod, setCreationMethod, selectedTemplate, templateName, templateDescription, htmlContent, htmlStyle, handlebarsCode, activeTab, handlebarsJson, setTemplateName, setTemplateDescription, resetTemplate } = useTemplateStore();
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
      case 4:
        return (
          <TemplateReviewStep type={creationMethod} />
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
      case 4:
        return (saveStatus === SaveStatusEnum.SAVING);
      default:
        return false;
    }
  };

  async function handleTemplateSave() {
    setSaveStatus(SaveStatusEnum.SAVING);
    try {
      await UpsertTemplate({
        description: templateDescription,
        email: user?.emailAddresses[0]?.emailAddress,
        templateName,
        templateContent: activeTab === EditorTypeEnum.VISUAL ? htmlContent : handlebarsCode,
        templateSampleData: activeTab === EditorTypeEnum.HANDLEBARS ? handlebarsJson : '{}',
        templateStyle: activeTab === EditorTypeEnum.VISUAL ? htmlStyle : '',
        templateType: activeTab === EditorTypeEnum.VISUAL ? TemplateType.HTML_BUILDER : TemplateType.HTML_BUILDER,
        creationMethod,
        templateGeneratedFrom: creationMethod === CreationMethodEnum.TEMPLATE_GALLERY ? selectedTemplate : '',
      });
      setSaveStatus(SaveStatusEnum.SUCCESS);
      resetTemplate();
      router.push('/dashboard');
    } catch (error) {
      setSaveStatus(SaveStatusEnum.ERROR);
      console.error('Error in saving Template', error);
    }
  }

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
          onComplete={handleTemplateSave}
        />
      </div>
    </div>
  );
}
