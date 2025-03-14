'use client';

import '@grapesjs/studio-sdk/style';

import { useUser } from '@clerk/nextjs';
import StudioEditor from '@grapesjs/studio-sdk/react';
import type { Editor } from 'grapesjs';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchTemplateById, generatePdf, PublishTemplateToProd, UpsertTemplate } from '@/libs/actions/templates';
import { TemplateType } from '@/types/Template';
import { downloadPDF } from '@/utils/DownloadPDF';

const HtmlBuilder = () => {
  const t = useTranslations('htmlEditor');
  const { user } = useUser();
  const [editor, setEditor] = useState<Editor>();
  const [templateName, setTemplateName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
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
    setIsSaving(true);
    if (!user) {
      return;
    }
    try {
      const html = editor?.getHtml();
      const css = editor?.getCss();

      if (!html) {
        toast.error(t('missing_content'));
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
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const publishTemplateToProd = async () => {
    setIsPublishing(true);
    try {
      const response = await PublishTemplateToProd(templateId as string);

      if (response) {
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePreview = async () => {
    setIsPreviewing(true);
    try {
      const html = editor?.getHtml();
      const css = editor?.getCss();

      if (!html) {
        toast.error(t('missing_content'));
        return;
      }

      const response = await generatePdf({
        templateType: TemplateType.HTML_BUILDER,
        templateContent: html,
        templateStyle: css,
        devMode: true,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      downloadPDF(response.pdf as string);
    } catch (error: any) {
      toast.error(`${error.message}`);
    } finally {
      setIsPreviewing(false);
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
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && (<Loader2 className="animate-spin" />)}
            {templateId ? 'Update' : 'Save'}
          </Button>
        </div>

        {templateId && (
          <div className="mr-4  flex justify-end p-1">
            <Button onClick={publishTemplateToProd} disabled={isPublishing}>
              {isPublishing && (<Loader2 className="animate-spin" />)}
              Publish
            </Button>
          </div>
        )}

        <div className="mr-4 flex justify-end p-1">
          <Button onClick={handlePreview} disabled={isPreviewing}>
            {isPreviewing && (<Loader2 className="animate-spin" />)}
            Preview PDF
          </Button>
        </div>

      </div>

      <StudioEditor
        style={{ height: '600px', width: '100%' }}
        onReady={onReady}
        options={{
          licenseKey: process.env.NEXT_PUBLIC_GRAPE_STUDIO_KEY as string,
          theme: 'light',
          pages: false,
          autoHeight: false,
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
  );
};

export default HtmlBuilder;
