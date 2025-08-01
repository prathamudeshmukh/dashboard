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

import { Button } from '@/components/ui/button';
import { PublishTemplateToProd, UpsertTemplate } from '@/libs/actions/templates';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import { extractJsonFromHtml } from '@/service/extractJsonFromHtml';
import { SaveStatusEnum, UpdateTypeEnum } from '@/types/Enum';
import { TemplateType } from '@/types/Template';
import { foregroundColor, primaryColor } from '@/utils/tailwindColor';

import { VariableInfoMessage } from '../steps/TemplateEditorStep';
import { loadTemplateContent } from './LoadTemplateContent';
import SampleJsonSchemaDialog from './SampleJsonSchemaDialog';

export default function HTMLBuilder() {
  const { user } = useUser();
  const [editor, setEditor] = useState<Editor>();
  const { templateName, templateDescription, htmlContent, htmlStyle, creationMethod, setTemplateName, setTemplateDescription, resetTemplate, setCreationMethod, setHtmlContent, setHtmlStyle, setHtmlTemplateJson } = useTemplateStore();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const [saveStatus, setSaveStatus] = useState<SaveStatusEnum>(SaveStatusEnum.IDLE);
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [pendingSaveType, setPendingSaveType] = useState<UpdateTypeEnum | null>(null);
  const [jsonPreview, setJsonPreview] = useState('');
  const router = useRouter();

  const containerRef = useRef(null);

  useEffect(() => {
    if (!editor) {
      return;
    }
    loadTemplateContent({
      editor,
      templateId,
      htmlContent,
      setHtmlContent,
      setHtmlStyle,
      setCreationMethod,
      setTemplateName,
      setTemplateDescription,
      setHtmlTemplateJson,
    });
  }, [editor, templateId]);

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
    const blocksToRemove = ['video', 'form', 'input', 'textarea', 'select', 'button', 'checkbox', 'radio', 'label', 'map', 'link', 'linkBox', 'navbar'];
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

  const handleSave = async (type: UpdateTypeEnum, extractedJson: string) => {
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
        templateSampleData: extractedJson,
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

  const handleSaveRequest = async (type: UpdateTypeEnum) => {
    const extracted = extractJsonFromHtml(htmlContent);
    const hasVars = Object.keys(extracted).length > 0;

    setJsonPreview(JSON.stringify(extracted, null, 2));
    setPendingSaveType(type);
    if (hasVars) {
      setShowJsonDialog(true);
      return;
    }
    await handleSave(type, JSON.stringify(extracted));
  };

  const confirmAndSave = async () => {
    await handleSave(pendingSaveType as UpdateTypeEnum, jsonPreview);
    setPendingSaveType(null);
    setShowJsonDialog(false);
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
      <div className="bg-amber-50/50 p-4">
        <VariableInfoMessage />
      </div>
      <div className="m-0 w-full rounded-md border p-0">
        <div className="gjs-editor-cont w-full">
          {/* GrapesJS StudioEditor container */}
          <div ref={containerRef} className="h-[700px] w-full">
            <StudioEditor
              onReady={onReady}
              options={{
                licenseKey: process.env.NEXT_PUBLIC_GRAPE_STUDIO_KEY as string,
                theme: 'light',
                customTheme: {
                  default: {
                    colors: {
                      component: {
                        background1: primaryColor,
                        background2: foregroundColor,
                      },
                      primary: {
                        background1: primaryColor,
                        backgroundHover: primaryColor,
                      },
                      selector: {
                        background1: primaryColor,
                      },
                      symbol: {
                        background1: primaryColor,
                      },
                      global: {
                        placeholder: primaryColor,
                        text: primaryColor,
                      },
                    },
                  },
                },
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
        <div className="flex justify-end gap-2">
          <Button
            className="rounded-full text-lg"
            onClick={() => handleSaveRequest(UpdateTypeEnum.UPDATE)}
            disabled={saveStatus === SaveStatusEnum.SAVING}
          >
            {saveStatus === SaveStatusEnum.SAVING ? 'Updating...' : 'Update'}
          </Button>

          <Button
            className="rounded-full text-lg"
            onClick={() => handleSaveRequest(UpdateTypeEnum.UPDATE_PUBLISH)}
            disabled={saveStatus === SaveStatusEnum.SAVING}
          >
            {saveStatus === SaveStatusEnum.SAVING ? 'Updating & Publishing...' : 'Update & Publish'}
          </Button>
        </div>
      )}

      <SampleJsonSchemaDialog
        onConfirm={confirmAndSave}
        defaultJson={jsonPreview}
        isOpen={showJsonDialog}
        onClose={() => setShowJsonDialog(false)}
      />
    </div>
  );
}
