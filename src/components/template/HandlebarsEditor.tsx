'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { fetchTemplateById, PublishTemplateToProd, UpsertTemplate } from '@/libs/actions/templates';
import { HandlebarsService } from '@/libs/services/HandlebarService';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import type { CreationMethodEnum } from '@/types/Enum';
import { SaveStatusEnum, UpdateTypeEnum } from '@/types/Enum';
import { TemplateType } from '@/types/Template';

import { Button } from '../ui/button';
import { DEFAULT_TEMPLATE } from './handlebars-editor/constants';
import { EditorToolbar } from './handlebars-editor/EditorToolbar';
import { JsonEditor } from './handlebars-editor/JsonEditor';
import { PreviewPanel } from './handlebars-editor/PreviewPanel';
import { TemplateEditor } from './handlebars-editor/TemplateEditor';

export default function HandlebarsEditor() {
  // Get page settings from the store
  const {
    templateName,
    templateDescription,
    handlebarsCode,
    handlebarsJson,
    creationMethod,
    setTemplateName,
    setTemplateDescription,
    setHandlebarsCode,
    setHandlebarsJson,
    setCreationMethod,
    resetTemplate,
  } = useTemplateStore();

  const [handlebarsPreview, setHandlebarsPreview] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [templateError, setTemplateError] = useState('');
  const [isHandlebarsLoading, setIsHandlebarsLoading] = useState(true);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [renderCount, setRenderCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatusEnum>(SaveStatusEnum.IDLE);
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');

  const handlebarsService = new HandlebarsService();

  // Set default template and data if none exists
  useEffect(() => {
    if (!handlebarsCode) {
      setHandlebarsCode(DEFAULT_TEMPLATE);
    }

    if (!handlebarsJson) {
      const defaultData = handlebarsService.getDatasetJson('default');
      setHandlebarsJson(JSON.stringify(defaultData, null, 2));
    }

    setIsEditorReady(true);
  }, [handlebarsCode, handlebarsJson, setHandlebarsCode, setHandlebarsJson]);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) {
        return;
      }
      try {
        const response = await fetchTemplateById(templateId);
        if (!response?.data) {
          return;
        }

        setTemplateName(response.data.templateName as string);
        setTemplateDescription(response.data.description as string);
        setCreationMethod(response.data.creationMethod as CreationMethodEnum);
        setHandlebarsCode(response.data.templateContent as string);
        setHandlebarsJson(JSON.stringify(response.data.templateSampleData));
      } catch (error) {
        console.error('Failed to load template for editing:', error);
      }
    };

    fetchTemplate();
  }, [templateId]);

  // Update the useEffect that renders the template to handle async rendering
  useEffect(() => {
    const renderTemplate = async () => {
      if (!isEditorReady) {
        return;
      }

      setIsHandlebarsLoading(true);
      try {
        // Validate JSON
        JSON.parse(handlebarsJson);
        setJsonError('');

        // Validate CSS
        try {
          const testElement = document.createElement('style');
          document.head.appendChild(testElement);
          document.head.removeChild(testElement);
        } catch (cssError) {
          console.error(`CSS Error: ${cssError}`);
        }

        // Render Handlebars template with current data
        const result = await handlebarsService.renderTemplate(handlebarsCode, handlebarsJson);
        setHandlebarsPreview(result);
        setTemplateError('');
        setRenderCount(prev => prev + 1);
      } catch (error: any) {
        console.error('Template rendering error:', error);
        if (error.message.includes('JSON')) {
          setJsonError(error.message);
        } else {
          setTemplateError(error.message);
          setHandlebarsPreview(`<div class="text-red-500 p-4">Error: ${error.message}</div>`);
        }
      } finally {
        setIsHandlebarsLoading(false);
      }
    };

    renderTemplate();
  }, [handlebarsCode, handlebarsJson, isEditorReady]);

  const refreshPreview = async () => {
    setIsHandlebarsLoading(true);
    try {
      const result = await handlebarsService.renderTemplate(handlebarsCode, handlebarsJson);
      setHandlebarsPreview(result);
      setRenderCount(prev => prev + 1);
    } catch (error) {
      console.error('Error rendering:', error);
    } finally {
      setIsHandlebarsLoading(false);
    }
  };

  // Render different content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'editor':
        return (
          <div className="flex h-full">
            {/* Left section (Editors) */}
            <div className="flex w-3/5 flex-col border-r border-gray-300">
              {/* Template Editor (top half) */}
              <div className="h-1/2">
                <TemplateEditor
                  code={handlebarsCode}
                  onChange={setHandlebarsCode}
                  error={templateError}
                  isReady={isEditorReady}
                />
              </div>

              {/* JSON Editor (bottom half) */}
              <div className="h-1/2">
                <JsonEditor
                  json={handlebarsJson}
                  onChange={setHandlebarsJson}
                  error={jsonError}
                  isReady={isEditorReady}
                />
              </div>
            </div>

            {/* Right section (Preview) */}
            <div className="h-[770px] w-2/4">
              <PreviewPanel
                preview={handlebarsPreview}
                isLoading={isHandlebarsLoading}
                renderCount={renderCount}
                onRefresh={refreshPreview}
              />
            </div>
          </div>
        );
      case 'preview':
        return (
          <div className="h-full">
            <PreviewPanel
              preview={handlebarsPreview}
              isLoading={isHandlebarsLoading}
              renderCount={renderCount}
              onRefresh={refreshPreview}

            />
          </div>
        );
      default:
        return null;
    }
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
        templateContent: handlebarsCode,
        templateSampleData: handlebarsJson,
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
    <>
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
      <div className="flex h-[800px] flex-col overflow-hidden rounded-md border text-black">
        {/* Toolbar and Tabs */}
        <EditorToolbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main Content based on active tab */}
        <div className="flex-1">{renderTabContent()}</div>
      </div>
    </>
  );
}
