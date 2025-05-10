'use client';

import '@grapesjs/studio-sdk/style';

import { useUser } from '@clerk/nextjs';
import StudioEditor from '@grapesjs/studio-sdk/react';
import type { Editor } from 'grapesjs';
import { debounce } from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import { fetchTemplateById, UpsertTemplate } from '@/libs/actions/templates';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import { type CreationMethodEnum, SaveStatusEnum } from '@/types/Enum';
import { TemplateType } from '@/types/Template';

import { Button } from '../ui/button';

export default function HTMLBuilder() {
  const { user } = useUser();
  const [editor, setEditor] = useState<Editor>();
  const { templateName, templateDescription, htmlContent, htmlStyle, creationMethod, setTemplateName, setTemplateDescription, resetTemplate, setCreationMethod, setHtmlContent, setHtmlStyle } = useTemplateStore();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const [saveStatus, setSaveStatus] = useState<SaveStatusEnum>(SaveStatusEnum.IDLE);
  const router = useRouter();

  const containerRef = useRef(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) {
        return;
      }
      try {
        const response = await fetchTemplateById(templateId);
        if (!response) {
          return;
        }
        setHtmlContent(response.data?.templateContent as string);
        setHtmlStyle(response.data?.templateStyle as string);
        setCreationMethod(response.data?.creationMethod as CreationMethodEnum);
        setTemplateName(response.data?.templateName as string);
        setTemplateDescription(response.data?.description as string);
      } catch (error) {
        console.error('Failed to load template for editing:', error);
      }
    };

    fetchTemplate();
  }, [templateId]);

  useEffect(() => {
    const loadTemplateData = async () => {
      if (!editor || !htmlContent) {
        return;
      }

      // Load the template data into the editor
      editor?.setComponents(htmlContent);

      if (templateId && htmlStyle) {
        editor?.setStyle(htmlStyle);
      }
    };

    if (editor) {
      loadTemplateData();
    }
  }, [editor]);

  const onReady = (editor: Editor) => {
    setEditor(editor);

    // Save HTML content when editor changes
    const updateContent = debounce(() => {
      const html = editor.getHtml();
      const css = editor.getCss();
      setHtmlContent(html);
      setHtmlStyle(css as string);
    }, 500); // adjust debounce timing

    editor.on('update', updateContent);

    // Block Manager
    const blockManager = editor.BlockManager;

    // Remove specific blocks
    const blocksToRemove = ['video', 'form', 'input', 'textarea', 'select', 'button', 'checkbox,', 'radio', 'label'];
    blocksToRemove.forEach((blockId) => {
      if (blockManager.get(blockId)) {
        blockManager.remove(blockId);
      }
    });

    // Check if canvas is empty and add placeholder
    if (editor.getComponents().length === 0) {
      editor.setComponents(`
            <div id="placeholder" style="text-align: center; padding: 50px; font-size: 18px; color: #aaa;">
              ✨ Click on <strong>"+"</strong> to get started!
            </div>
          `);
    }

    // Listen for component add event to remove placeholder
    editor.on('component:add', () => {
      const placeholder = editor?.Components?.getWrapper()?.find('#placeholder');
      if (placeholder?.length) {
        placeholder[0]?.remove();
      }
    });
  };

  const handleSave = async () => {
    setSaveStatus(SaveStatusEnum.SAVING);
    if (!user) {
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
        return;
      }
      toast.success('Template updated successfully');
      router.push('/dashboard');
      setSaveStatus(SaveStatusEnum.SUCCESS);
      resetTemplate();
    } catch (error) {
      setSaveStatus(SaveStatusEnum.ERROR);
      toast.error(`Error: ${error}`);
    }
  };

  return (
    <div className="flex w-full flex-col space-y-4">
      {templateId && (
        <h2 className="text-xl font-semibold">
          Edit Template :
          {' '}
          <span className="text-primary">{templateName}</span>
        </h2>
      )}
      <div className="m-0 w-full rounded-md border p-0">
        <div className="gjs-editor-cont w-full">
          {/* GrapesJS StudioEditor container */}
          <div ref={containerRef} className="h-[700px] w-full">
            <StudioEditor
              onReady={onReady}
              options={{
                licenseKey: process.env.NEXT_PUBLIC_GRAPE_STUDIO_KEY as string,
                theme: 'light',
                pages: false,
                autoHeight: false,
                devices: { selected: 'desktop' },
                settingsMenu: false,
                project: {
                  type: 'web',
                  id: uuidv4(),
                },
                identity: {
                  id: user?.id,
                },
              }}
            />
          </div>
        </div>
      </div>
      {templateId && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saveStatus === SaveStatusEnum.SAVING}>
            {saveStatus === SaveStatusEnum.SAVING ? 'Saving...' : 'Update'}
          </Button>
        </div>
      )}
    </div>
  );
}
