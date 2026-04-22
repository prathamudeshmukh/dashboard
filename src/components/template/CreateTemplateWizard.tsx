'use client';

import { useUser } from '@clerk/nextjs';
import type { JsonValue } from 'inngest/helpers/jsonify';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { PublishTemplateToProd, UpsertTemplate } from '@/libs/actions/templates';
import { trackEvent } from '@/libs/analytics/trackEvent';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import { CreationMethodEnum, EditorTypeEnum, SaveStatusEnum } from '@/types/Enum';
import { TemplateType } from '@/types/Template';

import { Wizard } from '../Wizard';
import { WizardNavigation } from '../WizardNavigation';
import TemplateCreationMethodSelector from './steps/TemplateCreationMethodSelector';
import TemplateDetailsStep from './steps/TemplateDetailsStep';
import TemplateEditorStep from './steps/TemplateEditorStep';
import TemplateReviewStep from './steps/TemplateReviewStep';
import TemplateSourceStep from './steps/TemplateSourceStep';

export default function CreateTemplateWizard() {
  const { user } = useUser();
  const router = useRouter();
  const [saveStatus, setSaveStatus] = useState<SaveStatusEnum>(SaveStatusEnum.IDLE);
  const [currentStep, setCurrentStep] = useState(0);
  const saveStatusRef = useRef(saveStatus);
  const currentStepRef = useRef(currentStep);
  saveStatusRef.current = saveStatus;
  currentStepRef.current = currentStep;
  const { creationMethod, selectedTemplate, templateName, templateDescription, htmlContent, htmlTemplateJson, htmlStyle, handlebarsCode, activeTab, handlebarTemplateJson, setSuccessData, templateError, jsonError } = useTemplateStore();
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

  useEffect(() => {
    trackEvent('wizard_step_viewed', {
      step: currentStep,
      step_name: steps[currentStep]?.id ?? 'unknown',
    });
  }, [currentStep]);

  useEffect(() => {
    return () => {
      if (saveStatusRef.current !== SaveStatusEnum.SUCCESS && currentStepRef.current > 0) {
        trackEvent('wizard_abandoned', {
          last_step: currentStepRef.current,
          last_step_name: steps[currentStepRef.current]?.id ?? 'unknown',
        });
      }
    };
  }, []);

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
      case 3: {
        if (activeTab === EditorTypeEnum.VISUAL) {
          return !htmlContent;
        }

        // Handlebars tab
        return !handlebarsCode || !!templateError || !!jsonError;
      }
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
        templateSampleData: activeTab === EditorTypeEnum.HANDLEBARS ? handlebarTemplateJson : htmlTemplateJson,
        templateStyle: activeTab === EditorTypeEnum.VISUAL ? htmlStyle : '',
        templateType: activeTab === EditorTypeEnum.VISUAL ? TemplateType.HTML_BUILDER : TemplateType.HANDLBARS_TEMPLATE,
        creationMethod,
        templateGeneratedFrom: creationMethod === CreationMethodEnum.TEMPLATE_GALLERY ? selectedTemplate : null,
      });
      await PublishTemplateToProd(response.templateId as string);

      // ✅ Analytics event for template creation
      trackEvent('template_created', {
        template_id: response.templateId as string,
        method:
          creationMethod === CreationMethodEnum.EXTRACT_FROM_PDF ? 'pdf' : 'gallery',
      });

      toast.success('Template Saved Successfully');
      setSaveStatus(SaveStatusEnum.SUCCESS);
      setSuccessData({
        templateId: response.templateId as string,
        templateName,
        templateSampleData: response.data?.templateSampleData as JsonValue,
      });

      router.push(`/dashboard/template/success`);
    } catch (error) {
      setSaveStatus(SaveStatusEnum.ERROR);
      toast.error(`Error in saving Template: ${error}`);
    }
  }

  return (
    <div className=" px-10 py-12">

      {/* Wizard progress */}
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
          saveStatus={saveStatus}
        />
      </div>
    </div>
  );
}
