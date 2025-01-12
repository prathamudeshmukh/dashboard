'use client';

import '@grapesjs/studio-sdk/style';

import StudioEditor from '@grapesjs/studio-sdk/react';
import type { Editor } from 'grapesjs';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { fetchTemplateById, saveTemplate, updateTemplate } from '@/libs/actions/templates';
import { TemplateType } from '@/types/Template';

const HtmlBuilder = () => {
  const [editor, setEditor] = useState<Editor>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId'); // Get templateId from query params

  useEffect(() => {
    const loadTemplateData = async () => {
      if (templateId) {
        const response = await fetchTemplateById(templateId);
        if (!response.success) {
          return;
        }
        // Load the template data into the editor
        editor?.setComponents(response.data?.templateContent as string);
        editor?.setStyle(response.data?.templateStyle);
      }
    };

    if (editor) {
      loadTemplateData();
    }
  }, [editor, templateId]);

  const onReady = (editor: Editor) => {
    setEditor(editor);
    if (!templateId) {
      editor.Commands.run('core:canvas-clear'); // Clear the canvas
    }
    // Block Manager
    const blockManager = editor.BlockManager;

    // Remove specific blocks
    const blocksToRemove = ['video', 'form', 'input', 'textarea', 'select', 'button', 'checkbox,', 'radio'];
    blocksToRemove.forEach((blockId) => {
      if (blockManager.get(blockId)) {
        blockManager.remove(blockId);
      }
    });
  };

  const saveProject = async () => {
    const html = editor?.getHtml();
    const css = editor?.getCss();

    if (templateId) {
      try {
        const response = await updateTemplate({
          templateId,
          description: 'My HTML Template',
          templateContent: html as string,
          templateStyle: css as string,
          templateSampleData: '',
        });

        if (response.success) {
          router.push('/dashboard');
        } else {
          throw new Error(response.error);
        }
      } catch (error: any) {
        console.error('Error saving template:', error);
      }
    } else {
      try {
        // Sample input data for the server action
        const templateSampleData = { key: 'value' }; // Example sample data
        const assets = ['https://example.com/asset1.png', 'https://example.com/asset2.png'];

        const response = await saveTemplate({
          description: 'My HTML Template',
          userId: 'c9ded72d-4cae-4fab-b86c-a084ec7f2ecc',
          templateContent: html as string,
          templateSampleData: JSON.stringify(templateSampleData),
          templateStyle: css as string,
          assets: JSON.stringify(assets),
          templateType: TemplateType.HTML_BUILDER,
        });

        if (response.success) {
          router.push('/dashboard');
        } else {
          throw new Error(response.error);
        }
      } catch (error: any) {
        console.error('Error saving template:', error);
      }
    }
  };

  return (
    <div>
      <StudioEditor
        style={{ height: '500px', width: '100%' }}
        onReady={onReady}
        options={{
          licenseKey: '',
          theme: 'light',
          pages: false,
          autoHeight: false,
          settingsMenu: false,
          project: {
            type: 'web',
          },
        }}
      />
      <div className="mr-4 mt-5 flex justify-end p-1">
        <Button className="mr-2 rounded border px-2" onClick={saveProject}>
          {templateId ? 'Update' : 'Save'}
        </Button>
      </div>
    </div>
  );
};

export default HtmlBuilder;
