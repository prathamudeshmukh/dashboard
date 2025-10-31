'use client';

import { Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { fetchTemplateById } from '@/libs/actions/templates';
import { HandlebarsService } from '@/libs/services/HandlebarService';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import type { CreationMethodEnum } from '@/types/Enum';
import type { PostMessagePayload } from '@/types/PostMessage';

import { EditorToolbar } from './handlebars-editor/EditorToolbar';
import { JsonEditor } from './handlebars-editor/JsonEditor';
import { PreviewPanel } from './handlebars-editor/PreviewPanel';
import { TemplateEditor } from './handlebars-editor/TemplateEditor';

function InfoMessage({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Lightbulb className="text-orange-300" />
      <p className="text-base font-normal text-muted-foreground">{text}</p>
    </div>
  );
}

export default function HandlebarsEditor() {
  // Get page settings from the store
  const {
    templateName,
    templateDescription,
    handlebarsCode,
    handlebarTemplateJson,
    creationMethod,
    setTemplateName,
    setTemplateDescription,
    setHandlebarsCode,
    setHandlebarTemplateJson,
    setCreationMethod,
    jsonError,
    templateError,
    setJsonError,
    setTemplateError,
  } = useTemplateStore();

  const [handlebarsPreview, setHandlebarsPreview] = useState('');
  const [isHandlebarsLoading, setIsHandlebarsLoading] = useState(true);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [renderCount, setRenderCount] = useState(0);
  const [isInFrame, setIsInFrame] = useState<boolean>(false);
  const [templateId, setTemplateId] = useState<string>('');

  const handlebarsService = new HandlebarsService();
  const [isTemplateLoaded, setIsTemplateLoaded] = useState(false);

  // Check if running in iframe and signal parent when ready
  useEffect(() => {
    const inIframe = window !== window.parent;
    setIsInFrame(inIframe);
    if (inIframe) {
      const message: PostMessagePayload = {
        type: 'IFRAME_LOADED',
        source: 'iframe',
      };
      window.parent.postMessage(message, '*');
    }
  }, []);

  // Listen for messages from parent (when in iframe)
  useEffect(() => {
    const handleMessage = (event: MessageEvent<PostMessagePayload>) => {
      const { type, data } = event.data;

      if (type === 'TEMPLATE_DATA_RESPONSE') {
        if (data) {
          setHandlebarsCode(data.handlebarsCode);
          setHandlebarTemplateJson(data.handlebarTemplateJson);
          setIsEditorReady(true);
        }
      }

      if (type === 'TEMPLATE_ID_RESPONSE') {
        if (data) {
          setTemplateId(data);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Send updates to parent when data changes (debounced)
  useEffect(() => {
    if (!isInFrame) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const message: PostMessagePayload = {
        type: 'TEMPLATE_UPDATE',
        data: {
          templateName,
          templateDescription,
          handlebarsCode,
          handlebarTemplateJson,
          creationMethod,
        },
        source: 'iframe',
      };
      window.parent.postMessage(message, '*');
    }, 500); // Debounce updates

    return () => clearTimeout(timeoutId);
  }, [isInFrame, templateName, templateDescription, handlebarsCode, handlebarTemplateJson, creationMethod]);

  // fetch data if template id is available
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId || isTemplateLoaded) {
        return;
      }

      try {
        const response = await fetchTemplateById(templateId);
        if (!response?.data) {
          return;
        }
        setTemplateName(response.data.templateName as string);
        setHandlebarsCode(response.data.templateContent as string);
        setHandlebarTemplateJson(JSON.stringify(response.data.templateSampleData));
        setTemplateDescription(response.data.description as string);
        setCreationMethod(response.data.creationMethod as CreationMethodEnum);
        setIsTemplateLoaded(true);
        setIsEditorReady(true);
      } catch (error) {
        console.error('Failed to load template for editing:', error);
      }
    };

    fetchTemplate();
  }, [
    templateId,
    isTemplateLoaded,
    setTemplateName,
    setTemplateDescription,
    setHandlebarsCode,
    setHandlebarTemplateJson,
    setCreationMethod,
    setIsTemplateLoaded,
    setIsEditorReady,
  ]);

  // Update the useEffect that renders the template to handle async rendering
  useEffect(() => {
    const renderTemplate = async () => {
      if (!isEditorReady) {
        return;
      }

      setIsHandlebarsLoading(true);
      try {
        // Validate JSON
        JSON.parse(handlebarTemplateJson);
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
        const result = await handlebarsService.renderTemplate(handlebarsCode, handlebarTemplateJson);
        setHandlebarsPreview(result);
        // Detect error HTML returned by service (no thrown error)
        const isError
          = /class="text-red-500/.test(result)
          || /^(?:Error|JSON Error|Template Error):/.test(
            result.replace(/<[^>]+>/g, '').trim(),
          );
        if (isError) {
          const plain = result.replace(/<[^>]+>/g, '').trim();
          // Only mark templateError if this isn't a JSON error
          if (!/^JSON Error:/i.test(plain)) {
            setTemplateError(plain);
          } else {
            setTemplateError('');
          }
        } else {
          setTemplateError('');
        }

        setRenderCount(prev => prev + 1);
      } catch (error: any) {
        console.error('Template rendering error:', error.message);
        if (error.message.includes('JSON')) {
          setJsonError(error.message);
          setTemplateError('');
          toast.error(`JSON Error: ${error.message}`, { position: 'bottom-right' });
        } else {
          setTemplateError(error.message);
        }
        setHandlebarsPreview(`<div class="text-red-500 p-4">Error: ${error.message}</div>`);
      } finally {
        setIsHandlebarsLoading(false);
      }
    };

    renderTemplate();
  }, [handlebarsCode, handlebarTemplateJson, isEditorReady]);

  const refreshPreview = async () => {
    setIsHandlebarsLoading(true);
    try {
      const result = await handlebarsService.renderTemplate(handlebarsCode, handlebarTemplateJson);
      setHandlebarsPreview(result);
      const isError
        = /class="text-red-500/.test(result)
        || /^(?:Error|JSON Error|Template Error):/.test(
          result.replace(/<[^>]+>/g, '').trim(),
        );
      if (isError) {
        const plain = result.replace(/<[^>]+>/g, '').trim();
        if (!/^JSON Error:/i.test(plain)) {
          setTemplateError(plain);
        } else {
          setTemplateError('');
        }
      } else {
        setTemplateError('');
      }
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
              <div className="h-1/2" data-testid="code-editor">
                <TemplateEditor
                  code={handlebarsCode}
                  onChange={setHandlebarsCode}
                  error={templateError}
                  isReady={isEditorReady}
                />
              </div>

              {/* JSON Editor (bottom half) */}
              <div className="h-1/2" data-testid="json-editor">
                <JsonEditor
                  json={handlebarTemplateJson}
                  onChange={setHandlebarTemplateJson}
                  error={jsonError}
                  isReady={isEditorReady}
                />
              </div>
            </div>

            {/* Right section (Preview) */}
            <div className="h-[770px] w-2/4" data-testid="preview-panel">
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
    <>
      {!templateId && (
        <div className="border-b bg-amber-50/50 p-4">
          <InfoMessage text="You're using the Code Editor. Use Handlebars syntax for full control. Prefer a visual approach? Try the Visual Editor." />
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
