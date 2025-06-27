/* eslint-disable no-console */
'use client';

import '@grapesjs/studio-sdk/style';

import { useUser } from '@clerk/nextjs';
// import StudioEditor from '@grapesjs/studio-sdk/react';
import type { Editor } from 'grapesjs';
import { debounce } from 'lodash';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import { fetchTemplateById, PublishTemplateToProd, UpsertTemplate } from '@/libs/actions/templates';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import { type CreationMethodEnum, SaveStatusEnum, UpdateTypeEnum } from '@/types/Enum';
import type { PostMessagePayload } from '@/types/PostMessage';
import { TemplateType } from '@/types/Template';

import { Button } from '../ui/button';

const StudioEditor = dynamic(() => import('@grapesjs/studio-sdk/react'), {
  ssr: false,
});
export default function HTMLBuilder() {
  const { user } = useUser();
  const { templateName, templateDescription, htmlContent, htmlStyle, creationMethod, setTemplateName, setTemplateDescription, resetTemplate, setCreationMethod, setHtmlContent, setHtmlStyle } = useTemplateStore();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const [saveStatus, setSaveStatus] = useState<SaveStatusEnum>(SaveStatusEnum.IDLE);
  const [isInFrame] = useState(false);
  const [dataReceived, setDataReceived] = useState(false);
  const [isTemplateLoaded, setIsTemplateLoaded] = useState(false);

  const router = useRouter();

  // === Receive data from parent ===
  useEffect(() => {
    console.info('::::useEffect1::::');
    const handleMessage = (event: MessageEvent<PostMessagePayload>) => {
      try {
        const { type, data } = event.data;

        if (type === 'TEMPLATE_DATA_RESPONSE') {
          console.info('TEMPLATE_DATA_RESPONSE received:', data);
          if (data?.htmlContent) {
            setHtmlContent(data.htmlContent);
          }
          if (data?.htmlStyle) {
            setHtmlStyle(data.htmlStyle);
          }
          setDataReceived(true);
        }
      } catch (err) {
        console.error('Failed to handle TEMPLATE_DATA_RESPONSE:', err);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    console.info('::::useEffect2::::');
    if (!isInFrame || !dataReceived) {
      return;
    }

    const timeoutId = setTimeout(() => {
      try {
        const message: PostMessagePayload = {
          type: 'TEMPLATE_UPDATE',
          data: {
            htmlContent,
            htmlStyle,
          },
          source: 'iframe',
        };
        console.info('TEMPLATE_UPDATE emitted:', message);
        window.parent.postMessage(message, '*');
      } catch (err) {
        console.error('Failed to emit TEMPLATE_UPDATE:', err);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [htmlContent, htmlStyle, isInFrame, dataReceived]);

  const onReady = async (editor: Editor) => {
    try {
      console.info('!!!!onReady!!!!');
      const message: PostMessagePayload = {
        type: 'IFRAME_LOADED',
        source: 'iframe',
      };
      console.info('IFRAME_LOADED emitted:', message);
      window.parent.postMessage(message, '*');
    } catch (err) {
      console.error('Failed to send IFRAME_LOADED message:', err);
    }

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
    const blocksToRemove = ['video', 'form', 'input', 'textarea', 'select', 'button', 'checkbox', 'radio', 'label'];
    blocksToRemove.forEach((blockId) => {
      if (blockManager.get(blockId)) {
        blockManager.remove(blockId);
      }
    });

    // Fetch template and populate editor
    try {
      if (templateId && !isTemplateLoaded) {
        console.info('Fetching template data');
        const response = await fetchTemplateById(templateId);
        if (response?.data) {
          const content = response.data.templateContent as string;
          const style = response.data.templateStyle as string;
          editor.setComponents(content);
          editor.setStyle(style);
          setHtmlContent(content);
          setHtmlStyle(style);
          setCreationMethod(response.data.creationMethod as CreationMethodEnum);
          setTemplateName(response.data.templateName as string);
          setTemplateDescription(response.data.description as string);
          setIsTemplateLoaded(true);
        }
      } else if (htmlContent) {
        editor.setComponents(htmlContent);
      }
    } catch (err) {
      console.error('Failed to load template for editing:', err);
    }

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

    editor.render();
  };

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
        <div className="gjs-editor-cont w-full">
          <div id="studio-editor-container" className="h-[700px] w-full" />
          {/* GrapesJS StudioEditor container */}
          <StudioEditor
            key="studio-editor"
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
