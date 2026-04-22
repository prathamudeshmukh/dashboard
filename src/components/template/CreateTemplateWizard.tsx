'use client';

import { useUser } from '@clerk/nextjs';
import type { JsonValue } from 'inngest/helpers/jsonify';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { PublishTemplateToProd, UpsertTemplate } from '@/libs/actions/templates';
import { trackEvent } from '@/libs/analytics/trackEvent';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import { EditorTypeEnum, SaveStatusEnum } from '@/types/Enum';
import { TemplateType } from '@/types/Template';

import { Wizard } from '../Wizard';
import { WizardNavigation } from '../WizardNavigation';
import TemplateEditorStep from './steps/TemplateEditorStep';
import TemplateReviewStep from './steps/TemplateReviewStep';
import TemplateSourceStep from './steps/TemplateSourceStep';

export default function CreateTemplateWizard() {
  const { user } = useUser();
  const router = useRouter();
  const [saveStatus, setSaveStatus] = useState<SaveStatusEnum>(SaveStatusEnum.IDLE);
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditorOptedIn, setIsEditorOptedIn] = useState(false);
  const saveStatusRef = useRef(saveStatus);
  const currentStepRef = useRef(currentStep);
  saveStatusRef.current = saveStatus;
  currentStepRef.current = currentStep;

  const {
    creationMethod,
    selectedTemplate,
    templateName,
    templateDescription,
    htmlContent,
    htmlStyle,
    htmlTemplateJson,
    handlebarsCode,
    activeTab,
    handlebarTemplateJson,
    setSuccessData,
    resetTemplate,
    clearSuccessData,
  } = useTemplateStore();

  const steps = isEditorOptedIn
    ? [
        { id: 'source', title: 'Select Template' },
        { id: 'editor', title: 'Edit Template' },
        { id: 'review', title: 'Review & Save' },
      ]
    : [
        { id: 'source', title: 'Select Template' },
        { id: 'review', title: 'Review & Save' },
      ];

  useEffect(() => {
    resetTemplate();
    clearSuccessData();
  }, []);

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

  const handleUseAsIs = () => setCurrentStep(1);

  const handleCustomize = () => {
    setIsEditorOptedIn(true);
    setCurrentStep(1);
  };

  const handleNext = () => setCurrentStep(prev => prev + 1);

  const handlePrevious = () => {
    if (currentStep === 1 && isEditorOptedIn) {
      setIsEditorOptedIn(false);
    }
    setCurrentStep(prev => prev - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <TemplateSourceStep onUseAsIs={handleUseAsIs} onCustomize={handleCustomize} />;
      case 1:
        return isEditorOptedIn ? <TemplateEditorStep /> : <TemplateReviewStep />;
      case 2:
        return <TemplateReviewStep />;
      default:
        return null;
    }
  };

  const isReviewStep = isEditorOptedIn ? currentStep === 2 : currentStep === 1;

  const isNextDisabled = (): boolean => {
    if (currentStep === 0) {
      return !htmlContent;
    }
    if (currentStep === 1 && isEditorOptedIn) {
      return !htmlContent;
    }
    if (isReviewStep) {
      return !templateName || !templateDescription || saveStatus === SaveStatusEnum.SAVING;
    }
    return false;
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
        templateGeneratedFrom: selectedTemplate ?? null,
      });
      await PublishTemplateToProd(response.templateId as string);

      trackEvent('template_created', {
        template_id: response.templateId as string,
        method: creationMethod === 'EXTRACT_FROM_PDF' ? 'pdf' : 'gallery',
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
    <div className="px-10 py-12">
      <Wizard
        steps={steps}
        currentStep={currentStep}
        onStepClick={(index) => {
          if (index <= currentStep || (index === currentStep + 1 && !isNextDisabled())) {
            setCurrentStep(index);
          }
        }}
        className="mb-8"
      />

      <div className="flex flex-col space-y-6">
        {renderStep()}
        <WizardNavigation
          totalSteps={steps.length}
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
