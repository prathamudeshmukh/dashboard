'use client';

import '@grapesjs/studio-sdk/style';

import { useUser } from '@clerk/nextjs';
import StudioEditor from '@grapesjs/studio-sdk/react';
import type { Editor } from 'grapesjs';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchTemplateById, PublishTemplateToProd, UpsertTemplate } from '@/libs/actions/templates';
import { TemplateType } from '@/types/Template';

const HtmlBuilder = () => {
  const { user } = useUser();
  const [editor, setEditor] = useState<Editor>();
  const [templateName, setTemplateName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId'); // Get templateId from query params

  useEffect(() => {
    const loadTemplateData = async () => {
      if (!templateId) {
        return;
      }

      const response = await fetchTemplateById(templateId);
      if (!response.success) {
        return;
      }
      // Load the template data into the editor
      editor?.setComponents(response.data?.templateContent as string);
      editor?.setStyle(response.data?.templateStyle);
      setTemplateName(response.data?.templateName as string);
      setDescription(response.data?.description as string);
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

  const handleSave = async () => {
    const html = editor?.getHtml();
    const css = editor?.getCss();

    if (!html || !css) {
      throw new Error('Editor content is missing');
    }

    if (!user) {
      return;
    }

    // Prepare template data
    const templateData = {
      templateId: templateId || undefined,
      description,
      email: user.emailAddresses[0]?.emailAddress,
      templateName,
      templateContent: html,
      templateStyle: css,
      assets: JSON.stringify(['https://example.com/asset1.png']),
      templateType: TemplateType.HTML_BUILDER,
    };

    const response = await UpsertTemplate(templateData);

    if (response.success) {
      router.push('/dashboard');
    }
  };

  const publishTemplateToProd = async () => {
    const response = await PublishTemplateToProd(templateId as string);

    if (response) {
      router.push('/dashboard');
    }
  };

  return (
    <div>
      <div className="my-2 flex flex-row justify-between">
        <Input
          name="templateName"
          value={templateName}
          onChange={e => setTemplateName(e.target.value)}
          placeholder="Enter Template name"
          className="w-1/3 border border-gray-300"
        />

        <Input
          name="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter Description"
          className="w-1/3 border border-gray-300"
        />

        <div className="mr-4 flex justify-end p-1">
          <Button className="mr-2 rounded border px-2" onClick={handleSave}>
            {templateId ? 'Update' : 'Save'}
          </Button>
        </div>

        {templateId && (
          <div className="mr-4  flex justify-end p-1">
            <Button className="mr-2 rounded border px-2" onClick={publishTemplateToProd}>
              Publish
            </Button>
          </div>
        )}

      </div>

      <StudioEditor
        style={{ height: '600px', width: '100%' }}
        onReady={onReady}
        options={{
          licenseKey: process.env.GRAPE_STUDIO_KEY as string,
          theme: 'light',
          pages: false,
          autoHeight: false,
          settingsMenu: false,
          project: {
            type: 'web',
          },
        }}
      />

    </div>
  );
};

export default HtmlBuilder;
