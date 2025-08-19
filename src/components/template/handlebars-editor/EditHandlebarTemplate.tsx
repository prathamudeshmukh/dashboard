'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { PublishTemplateToProd, UpsertTemplate } from '@/libs/actions/templates';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import { SaveStatusEnum, UpdateTypeEnum } from '@/types/Enum';
import { TemplateType } from '@/types/Template';

const EditHandlebarTemplate = () => {
  const {
    templateName,
    templateDescription,
    handlebarsCode,
    handlebarTemplateJson,
    creationMethod,
    setTemplateName,
    setTemplateDescription,
    setHandlebarsCode,
    setHandlebarTemplateJson,
    setCreationMethod,
    resetTemplate,
  } = useTemplateStore();
  const locale = useLocale();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const { user } = useUser();
  const router = useRouter();
  const [saveStatus, setSaveStatus] = useState<SaveStatusEnum>(SaveStatusEnum.IDLE);

  // Send data to iframe
  const sendDataToIframe = (templateId: string) => {
    try {
      if (!iframeRef.current || !iframeRef.current.contentWindow) {
        console.warn('No iframe found or iframe is not ready to receive data.');
        return;
      }

      const message = {
        type: 'TEMPLATE_ID_RESPONSE',
        data: templateId,
        source: 'parent',
      };

      iframeRef.current.contentWindow.postMessage(message, '*');
    } catch (err) {
      console.error('Failed to send TEMPLATE_DATA_RESPONSE to iframe:', err);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        // Optional: verify origin for security
        if (!event.origin.includes(window.location.origin)) {
          console.warn('Message ignored: invalid origin', event.origin);
          return;
        }

        const { type, source, data } = event.data;

        switch (type) {
          case 'IFRAME_LOADED':
            if (source === 'iframe') {
              sendDataToIframe(templateId as string);
            }
            break;

          case 'TEMPLATE_UPDATE':
            if (data) {
              setHandlebarsCode(data.handlebarsCode);
              setHandlebarTemplateJson(data.handlebarTemplateJson);
              setTemplateName(data.templateName);
              setTemplateDescription(data.templateDescription);
              setCreationMethod(data.creationMethod);
            }
            break;

          default:
            break;
        }
      } catch (err) {
        console.error('Error handling postMessage from iframe:', err);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [templateId]);

  const handleSave = async (type: UpdateTypeEnum) => {
    setSaveStatus(SaveStatusEnum.SAVING);
    if (!user) {
      setSaveStatus(SaveStatusEnum.ERROR);
      return;
    }
    try {
      const templateData = {
        templateId,
        description: templateDescription,
        email: user?.emailAddresses[0]?.emailAddress,
        templateName,
        templateContent: handlebarsCode,
        templateSampleData: handlebarTemplateJson,
        templateType: TemplateType.HANDLBARS_TEMPLATE,
        creationMethod,
      };

      const response = await UpsertTemplate(templateData);

      if (!response) {
        setSaveStatus(SaveStatusEnum.ERROR);
        return;
      }
      if (type === UpdateTypeEnum.UPDATE) {
        toast.success('Template updated successfully');
        router.push('/dashboard');
        resetTemplate();
      } else if (type === UpdateTypeEnum.UPDATE_PUBLISH) {
        if (response?.templateId) {
          await PublishTemplateToProd(response?.templateId);
          toast.success('Template updated and published successfully');
          router.push('/dashboard');
          resetTemplate();
        } else {
          toast.error('Template ID not found after update, cannot publish.');
          setSaveStatus(SaveStatusEnum.ERROR);
        }
      }
      setSaveStatus(SaveStatusEnum.SUCCESS);
    } catch (error) {
      setSaveStatus(SaveStatusEnum.ERROR);
      toast.error(`Error: ${error}`);
    }
  };

  return (
    <div>
      {templateId && (
        <div className="flex items-center justify-between px-4 py-2">
          <h2 className="text-2xl font-semibold">
            Edit Template:
            {' '}
            {templateName || 'Unnamed'}
          </h2>
          <div className="flex justify-end gap-2">
            <Button
              className="rounded-full text-lg"
              onClick={() => handleSave(UpdateTypeEnum.UPDATE)}
              disabled={saveStatus === SaveStatusEnum.SAVING}
            >
              {saveStatus === SaveStatusEnum.SAVING ? 'Updating...' : 'Update'}
            </Button>

            <Button
              className="rounded-full text-lg"
              onClick={() => handleSave(UpdateTypeEnum.UPDATE_PUBLISH)}
              disabled={saveStatus === SaveStatusEnum.SAVING}
            >
              {saveStatus === SaveStatusEnum.SAVING ? 'Updating & Publishing...' : 'Update & Publish'}
            </Button>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        title="Handlebar Editor"
        className="min-h-[900px] w-full border-0"
        src={`/${locale}/editor/code-editor`}
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
};

export default EditHandlebarTemplate;
