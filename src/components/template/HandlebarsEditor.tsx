'use client';

import { useEffect, useState } from 'react';

import { HandlebarsService } from '@/libs/services/HandlebarService';
import { useTemplateStore } from '@/libs/store/TemplateStore';

import { DEFAULT_TEMPLATE } from './handlebars-editor/constants';
import { EditorToolbar } from './handlebars-editor/EditorToolbar';
import { JsonEditor } from './handlebars-editor/JsonEditor';
import { PreviewPanel } from './handlebars-editor/PreviewPanel';
import { StatusBar } from './handlebars-editor/StatusBar';
import { TemplateEditor } from './handlebars-editor/TemplateEditor';

export default function HandlebarsEditor() {
  // Get page settings from the store
  const {
    handlebarsCode,
    setHandlebarsCode,
    handlebarsJson,
    setHandlebarsJson,
  } = useTemplateStore();

  const [handlebarsPreview, setHandlebarsPreview] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [templateError, setTemplateError] = useState('');
  const [isHandlebarsLoading, setIsHandlebarsLoading] = useState(true);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [renderCount, setRenderCount] = useState(0);

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
              <div className="h-1/2 border-b border-gray-300">
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
            <div className="w-2/5">
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

  return (
    <div className="flex h-[800px] flex-col overflow-hidden rounded-md border text-black">
      {/* Toolbar and Tabs */}
      <EditorToolbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content based on active tab */}
      <div className="flex-1">{renderTabContent()}</div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}
