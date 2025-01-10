'use client';

import '@grapesjs/studio-sdk/style';

import StudioEditor, { StudioCommands, ToastVariant } from '@grapesjs/studio-sdk/react';
import type { Editor } from 'grapesjs';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { saveTemplate } from '@/libs/actions/templates';

const HtmlBuilder = () => {
  const [editor, setEditor] = useState<Editor>();
  const router = useRouter();

  const onReady = (editor: Editor) => {
    setEditor(editor);

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
    if (editor) {
      const html = editor.getHtml();
      const css = editor.getCss();

      // Sample input data for the server action
      const templateSampleData = { key: 'value' }; // Example sample data
      const assets = ['https://example.com/asset1.png', 'https://example.com/asset2.png'];

      try {
        const response = await saveTemplate({
          description: 'My HTML Template',
          userId: 1,
          templateContent: html,
          templateSampleData: JSON.stringify(templateSampleData),
          templateStyle: css as string,
          assets: JSON.stringify(assets),
        });

        if (response.success) {
          await editor.runCommand(StudioCommands.toastAdd, {
            id: 'save-success',
            header: 'Save Successful',
            content: 'Project saved successfully!',
            variant: ToastVariant.Success,
          });
          router.push('/dashboard');
        } else {
          throw new Error(response.error);
        }
      } catch (error: any) {
        console.error('Error saving template:', error);
        editor.runCommand(StudioCommands.toastAdd, {
          id: 'save-failed',
          header: 'Save Failed',
          content: `Failed to save project: ${error.message}`,
          variant: ToastVariant.Error,
        });
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
          Save Project
        </Button>
      </div>
    </div>
  );
};

export default HtmlBuilder;
