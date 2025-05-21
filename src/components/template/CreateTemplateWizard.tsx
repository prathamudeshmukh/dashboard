'use client';

import { useUser } from '@clerk/nextjs';
import type { JsonValue } from 'inngest/helpers/jsonify';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { PublishTemplateToProd, UpsertTemplate } from '@/libs/actions/templates';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import { CreationMethodEnum, SaveStatusEnum } from '@/types/Enum';
import { type TemplateSuccessData, TemplateType } from '@/types/Template';

import { Wizard } from '../Wizard';
import { WizardNavigation } from '../WizardNavigation';
import TemplateCreationMethodSelector from './steps/TemplateCreationMethodSelector';
import TemplateDetailsStep from './steps/TemplateDetailsStep';
import TemplateEditorStep, { EditorTypeEnum } from './steps/TemplateEditorStep';
import TemplateReviewStep from './steps/TemplateReviewStep';
import TemplateSourceStep from './steps/TemplateSourceStep';
import SuccessView from './Success-view';

export default function CreateTemplateWizard() {
  const { user } = useUser();
  const router = useRouter();
  const [saveStatus, setSaveStatus] = useState<SaveStatusEnum>(SaveStatusEnum.IDLE);
  const [currentStep, setCurrentStep] = useState(0);
  const { creationMethod, selectedTemplate, templateName, templateDescription, htmlContent, htmlStyle, handlebarsCode, activeTab, handlebarsJson, resetTemplate } = useTemplateStore();
  const handleNext = () => setCurrentStep(prev => prev + 1);
  const handlePrevious = () => setCurrentStep(prev => prev - 1);
  const [successData, setSuccessData] = useState<TemplateSuccessData | null>(null);

  const steps = [
    { id: 'method', title: 'Choose Method' },
    {
      id: 'source',
      title: creationMethod === CreationMethodEnum.EXTRACT_FROM_PDF ? 'Upload PDF' : 'Select Template',
    },
    { id: 'details', title: 'Template Details' },
    { id: 'editor', title: 'Edit Template' },
    { id: 'review', title: 'Review & Save' },
    { id: 'success', title: 'Success' },
  ];

  // Handle creating another template
  const handleCreateAnother = () => {
    resetTemplate();
    setSuccessData(null);
    setSaveStatus(SaveStatusEnum.IDLE);
    setCurrentStep(0);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <TemplateCreationMethodSelector />
        );
      case 1:
        return (
          <TemplateSourceStep />
        );
      case 2:
        return (
          <TemplateDetailsStep />
        );
      case 3:
        return (
          <TemplateEditorStep />
        );
      case 4:
        return (
          <TemplateReviewStep />
        );
      case 5:
        return successData
          ? (
              <SuccessView
                templateId={successData.templateId}
                templateName={successData.templateName}
                templateSampleData={successData.templateSampleData as string}
                onViewDashboard={() => router.push('/dashboard')}
                onCreateAnother={handleCreateAnother}
              />
            )
          : null;
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
      const response = await UpsertTemplate({
        description: templateDescription,
        email: user?.emailAddresses[0]?.emailAddress,
        templateName,
        templateContent: activeTab === EditorTypeEnum.VISUAL ? htmlContent : handlebarsCode,
        templateSampleData: activeTab === EditorTypeEnum.HANDLEBARS ? handlebarsJson : '{}',
        templateStyle: activeTab === EditorTypeEnum.VISUAL ? htmlStyle : '',
        templateType: activeTab === EditorTypeEnum.VISUAL ? TemplateType.HTML_BUILDER : TemplateType.HANDLBARS_TEMPLATE,
        creationMethod,
        templateGeneratedFrom: creationMethod === CreationMethodEnum.TEMPLATE_GALLERY ? selectedTemplate : null,
      });
      await PublishTemplateToProd(response.templateId as string);
      toast.success('Template Saved Successfully');
      setSaveStatus(SaveStatusEnum.SUCCESS);
      // Set success data with template information
      setSuccessData({
        templateId: response.templateId as string,
        templateName,
        templateSampleData: JSON.stringify(response.data?.templateSampleData as JsonValue),
      });

      // Move to success step
      setCurrentStep(5);
    } catch (error) {
      setSaveStatus(SaveStatusEnum.ERROR);
      toast.error(`Error in saving Template: ${error}`);
    }
  }

  // Show navigation only if not on success step
  const showNavigation = currentStep < 5;

  return (
    <div className=" px-10 py-12">

      {/* Wizard progress - only show if not on success step */}
      {currentStep < 5 && (
        <Wizard
          steps={steps.slice(0, 5)} // Don't show success step in progress bar
          currentStep={currentStep}
          onStepClick={(index) => {
            // Only allow clicking on completed steps or the current step + 1
            if (index <= currentStep || (index === currentStep + 1 && !isNextDisabled())) {
              setCurrentStep(index);
            }
          }}
          className="mb-8"
        />
      )}

      {/* Navigation */}
      <div className="flex flex-col space-y-6">
        {renderStep()}

        {/* Only show navigation buttons if not on success step */}
        {showNavigation && (
          <WizardNavigation
            totalSteps={5} // Keep total steps at 5 for navigation
            currentStep={currentStep}
            onNext={handleNext}
            onPrevious={handlePrevious}
            disableNext={isNextDisabled()}
            onComplete={handleTemplateSave}
            saveStatus={saveStatus}
          />
        )}
      </div>
    </div>
  );
}
