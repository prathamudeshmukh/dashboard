'use client';

import '@grapesjs/studio-sdk/style';

import { useUser } from '@clerk/nextjs';
import StudioEditor from '@grapesjs/studio-sdk/react';
import type { Editor } from 'grapesjs';
import { debounce } from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import { fetchTemplateById, PublishTemplateToProd, UpsertTemplate } from '@/libs/actions/templates';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import { type CreationMethodEnum, SaveStatusEnum, UpdateTypeEnum } from '@/types/Enum';
import { TemplateType } from '@/types/Template';

import { Button } from '../ui/button';

export default function HTMLBuilder() {
  const { user } = useUser();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const { templateName, templateDescription, htmlContent, htmlStyle, creationMethod, setTemplateName, setTemplateDescription, resetTemplate, setCreationMethod, setHtmlContent, setHtmlStyle } = useTemplateStore();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const [saveStatus, setSaveStatus] = useState<SaveStatusEnum>(SaveStatusEnum.IDLE);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<Editor | null>(null);

  // Memoize the project configuration to prevent unnecessary re-renders
  const projectConfig = useMemo(() => ({
    type: 'web' as const,
    id: templateId || uuidv4(),
  }), [templateId]);

  const loadTemplate = useCallback(async () => {
    if (!editor || !isEditorReady || templateLoaded) {
      return;
    }

    try {
      if (templateId) {
        const response = await fetchTemplateById(templateId);
        if (!response?.data) {
          console.warn('No template data found');
          return;
        }
        const content = response.data?.templateContent as string;
        const style = response.data?.templateStyle as string;

        setHtmlContent(content);
        setHtmlStyle(style);
        setCreationMethod(response.data?.creationMethod as CreationMethodEnum);
        setTemplateName(response.data?.templateName as string);
        setTemplateDescription(response.data?.description as string);

        // Load content into editor with error handling
        try {
          if (content) {
            editor.setComponents(content);
          }
          if (style) {
            editor.setStyle(style);
          }
        } catch (editorError) {
          console.error('Error setting editor content:', editorError);
          toast.error('Failed to load template content into editor');
        }

        setTemplateLoaded(true);
      } else if (htmlContent && !templateLoaded) {
        // Load existing content from store
        try {
          editor.setComponents(htmlContent);
          if (htmlStyle) {
            editor.setStyle(htmlStyle);
          }
          setTemplateLoaded(true);
        } catch (editorError) {
          console.error('Error setting stored content:', editorError);
        }
      }
    } catch (error) {
      console.error('Failed to load template:', error);
      toast.error('Failed to load template data');
    }
  }, [
    editor,
    isEditorReady,
    templateLoaded,
    templateId,
    htmlContent,
    htmlStyle,
    setHtmlContent,
    setHtmlStyle,
    setCreationMethod,
    setTemplateName,
    setTemplateDescription,
  ]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const onReady = useCallback((editorInstance: Editor) => {
    try {
      // Store editor reference
      setEditor(editorInstance);
      editorInstanceRef.current = editorInstance;
      setIsEditorReady(true);

      // Set up debounced content update
      const updateContent = debounce(() => {
        try {
          const html = editorInstance.getHtml();
          const css = editorInstance.getCss();
          setHtmlContent(html);
          setHtmlStyle(css as string);
        } catch (error) {
          console.error('Error updating content:', error);
        }
      }, 500);

      // Add event listeners with error handling
      try {
        editorInstance.on('update', updateContent);
      } catch (error) {
        console.error('Error setting up update listener:', error);
      }

      // Configure Block Manager
      try {
        const blockManager = editorInstance.BlockManager;
        if (blockManager) {
          const blocksToRemove = ['video', 'form', 'input', 'textarea', 'select', 'button', 'checkbox', 'radio', 'label'];
          blocksToRemove.forEach((blockId) => {
            const block = blockManager.get(blockId);
            if (block) {
              blockManager.remove(blockId);
            }
          });
        }
      } catch (error) {
        console.error('Error configuring block manager:', error);
      }

      // Add placeholder if canvas is empty
      try {
        const components = editorInstance.getComponents();
        if (components && components.length === 0) {
          editorInstance.setComponents(`
            <div id="placeholder" style="text-align: center; padding: 50px; font-size: 18px; color: #aaa;">
              ✨ Click on <strong>"+"</strong> to get started!
            </div>
          `);
        }
      } catch (error) {
        console.error('Error adding placeholder:', error);
      }

      // Set up component add listener
      try {
        editorInstance.on('component:add', () => {
          try {
            const wrapper = editorInstance.Components?.getWrapper();
            const placeholder = wrapper?.find('#placeholder');
            if (placeholder && placeholder.length > 0) {
              placeholder[0]?.remove();
            }
          } catch (error) {
            console.error('Error removing placeholder:', error);
          }
        });
      } catch (error) {
        console.error('Error setting up component:add listener:', error);
      }
    } catch (error) {
      console.error('Error in onReady callback:', error);
      toast.error('Editor initialization failed');
    }
  }, [setHtmlContent, setHtmlStyle]);

  const handleSave = async (type: UpdateTypeEnum) => {
    setSaveStatus(SaveStatusEnum.SAVING);
    if (!user) {
      setSaveStatus(SaveStatusEnum.ERROR);
      toast.error('User not authenticated');
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
        toast.error('Failed to save template: No response.');
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
          return;
        }
      }

      setSaveStatus(SaveStatusEnum.SUCCESS);
    } catch (error) {
      setSaveStatus(SaveStatusEnum.ERROR);
      toast.error(`Error: ${error}`);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (editorInstanceRef.current) {
        try {
          // Clean up any listeners or resources if needed
          editorInstanceRef.current = null;
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      }
    };
  }, []);

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
        <div className="gjs-editor-cont w-full">
          <div ref={containerRef} className="h-[700px] w-full">
            {user && (
              <StudioEditor
                onReady={onReady}
                options={{
                  licenseKey: process.env.NEXT_PUBLIC_GRAPE_STUDIO_KEY as string,
                  theme: 'light',
                  pages: false,
                  autoHeight: false,
                  devices: { selected: 'desktop' },
                  settingsMenu: false,
                  project: projectConfig,
                  identity: {
                    id: user?.id,
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>
      {templateId && (
        <div className="flex justify-end gap-2">
          <Button
            className="rounded-full text-lg"
            onClick={() => handleSave(UpdateTypeEnum.UPDATE)}
            disabled={saveStatus === SaveStatusEnum.SAVING || !isEditorReady}
          >
            {saveStatus === SaveStatusEnum.SAVING ? 'Updating...' : 'Update'}
          </Button>

          <Button
            className="rounded-full text-lg"
            onClick={() => handleSave(UpdateTypeEnum.UPDATE_PUBLISH)}
            disabled={saveStatus === SaveStatusEnum.SAVING || !isEditorReady}
          >
            {saveStatus === SaveStatusEnum.SAVING ? 'Updating & Publishing...' : 'Update & Publish'}
          </Button>
        </div>
      )}
    </div>
  );
}
