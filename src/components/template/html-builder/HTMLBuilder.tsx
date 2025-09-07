'use client';

import { useUser } from '@clerk/nextjs';
import type { Editor } from 'grapesjs';
import { TemplateEditor } from 'grapesjs-hbs-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { PublishTemplateToProd, UpsertTemplate } from '@/libs/actions/templates';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import { SaveStatusEnum, UpdateTypeEnum } from '@/types/Enum';
import { TemplateType } from '@/types/Template';

import { loadTemplateContent } from './LoadTemplateContent';

export default function HTMLBuilder() {
  const { user } = useUser();
  const [editor, setEditor] = useState<Editor>();
  const { templateName, templateDescription, htmlContent, handlebarsCode, htmlStyle, htmlTemplateJson, creationMethod, setTemplateName, setHtmlTemplateJson, setTemplateDescription, resetTemplate, setCreationMethod, setHtmlContent, setHtmlStyle } = useTemplateStore();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const [saveStatus, setSaveStatus] = useState<SaveStatusEnum>(SaveStatusEnum.IDLE);
  const router = useRouter();

  useEffect(() => {
    loadTemplateContent({
      editor: editor as Editor,
      templateId,
      setHtmlContent,
      setHtmlTemplateJson,
      setHtmlStyle,
      setCreationMethod,
      setTemplateName,
      setTemplateDescription,
    });
  }, [editor, templateId]);

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
        templateContent: htmlContent,
        templateStyle: htmlStyle,
        templateType: TemplateType.HTML_BUILDER,
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
    <div className="flex w-full flex-col space-y-4">
      {templateId && (
        <h2 className="text-2xl font-semibold">
          Edit Template :
          {' '}
          <span className="text-primary">{templateName}</span>
        </h2>
      )}
      <div className="m-0 w-full rounded-md border p-0">
        <div className="w-full">
          {/* GrapesJS StudioEditor container */}
          <div className="w-full">
            <TemplateEditor
              onEditor={editor => setEditor(editor)}
              dataSources={JSON.parse(htmlTemplateJson)}
              sampleData={JSON.parse(htmlTemplateJson)}
              initialHbs={handlebarsCode}
              onChange={hbs => setHtmlContent(hbs)}
            />
          </div>
        </div>
      </div>
      {templateId && (
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
      )}
    </div>
  );
}
