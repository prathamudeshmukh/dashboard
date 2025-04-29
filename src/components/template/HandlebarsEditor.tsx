'use client';

import { useEffect, useState } from 'react';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { HandlebarsService } from '@/libs/services/HandlebarService';
import { useTemplateStore } from '@/libs/store/TemplateStore';

import { DEFAULT_STYLES, DEFAULT_TEMPLATE } from './handlebars-editor/constants';
import { EditorToolbar } from './handlebars-editor/EditorToolbar';
import { JsonEditor } from './handlebars-editor/JsonEditor';
import { PreviewPanel } from './handlebars-editor/PreviewPanel';
import { StatusBar } from './handlebars-editor/StatusBar';
import { StyleEditor } from './handlebars-editor/StyleEditor';
import { TemplateEditor } from './handlebars-editor/TemplateEditor';
import type { PanelSizes, PanelType } from './handlebars-editor/types';
import { readFileAsText } from './handlebars-editor/utils';

export default function HandlebarsEditor() {
  // Get page settings from the store
  const {
    handlebarsCode,
    setHandlebarsCode,
    handlebarsJson,
    setHandlebarsJson,
  } = useTemplateStore();

  const [handlebarsPreview, setHandlebarsPreview] = useState('');
  const [handlebarsStyles, setHandlebarsStyles] = useState(DEFAULT_STYLES);
  const [jsonError, setJsonError] = useState('');
  const [templateError, setTemplateError] = useState('');
  const [stylesError, setStylesError] = useState('');
  const [isHandlebarsLoading, setIsHandlebarsLoading] = useState(true);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [renderCount, setRenderCount] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);

  // State for maximized panels
  const [maximizedPanel, setMaximizedPanel] = useState<PanelType>('none');

  // Store previous panel sizes when maximizing
  const [previousSizes, setPreviousSizes] = useState<PanelSizes>({
    leftPanel: 60,
    templatePanel: 50,
    jsonPanel: 50,
  });

  const handlebarsService = new HandlebarsService();

  const handleFileUpload = async (event: any) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const content = await readFileAsText(file);
        setHandlebarsCode(content);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }
  };

  // Make the file upload handler available globally for the toolbar component
  useEffect(() => {
    ;(window as any).handleFileUpload = handleFileUpload;
    return () => {
      delete (window as any).handleFileUpload;
    };
  }, []);

  // Set default template and data if none exists
  useEffect(() => {
    if (!handlebarsCode || handlebarsCode.trim() === '') {
      setHandlebarsCode(DEFAULT_TEMPLATE);
    }

    if (!handlebarsJson || handlebarsJson.trim() === '{}') {
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
          testElement.textContent = handlebarsStyles;
          document.head.appendChild(testElement);
          document.head.removeChild(testElement);
          setStylesError('');
        } catch (cssError) {
          setStylesError(`CSS Error: ${cssError}`);
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
  }, [handlebarsCode, handlebarsJson, handlebarsStyles, isEditorReady]);

  const formatCode = () => {
    try {
      // Format Handlebars code
      const formattedCode = handlebarsService.formatHandlebarsCode(handlebarsCode);
      setHandlebarsCode(formattedCode);

      // Format JSON
      const formattedJson = JSON.stringify(JSON.parse(handlebarsJson), null, 2);
      setHandlebarsJson(formattedJson);

      // Format CSS
      // This is a simple formatter - in a real app, you'd use a proper CSS formatter
      const formattedCss = handlebarsStyles
        .split('}')
        .map((block) => {
          if (!block.trim()) {
            return '';
          }
          const lines = block.split('{');
          if (lines.length === 2) {
            const selector = lines[0]?.trim();
            const properties = lines[1]?.trim();
            const formattedProperties = properties
              ?.split(';')
              .map(prop => prop.trim())
              .filter(Boolean)
              .map(prop => `  ${prop};`)
              .join('\n');
            return `${selector} {\n${formattedProperties}\n}`;
          }
          return block;
        })
        .filter(Boolean)
        .join('\n\n');

      setHandlebarsStyles(formattedCss);
    } catch (error) {
      console.error('Error formatting code:', error);
    }
  };

  const generateTemplateWithAI = () => {
    // In a real app, this would call an AI service

  };

  // Function to handle maximizing/minimizing panels
  const toggleMaximize = (panel: PanelType) => {
    if (maximizedPanel === panel) {
      // Restore previous layout
      setMaximizedPanel('none');
    } else {
      // Save current layout before maximizing
      setPreviousSizes({
        leftPanel: maximizedPanel === 'none' ? 60 : previousSizes.leftPanel,
        templatePanel: maximizedPanel === 'none' ? 50 : previousSizes.templatePanel,
        jsonPanel: maximizedPanel === 'none' ? 50 : previousSizes.jsonPanel,
      });

      // Set the maximized panel
      setMaximizedPanel(panel);
    }
  };

  const saveTemplate = () => {
    // Simulate saving
    setLastSaved(null);
  };

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

  const runPreview = () => {
    const previewPanel = document.getElementById('preview-panel');
    if (previewPanel) {
      previewPanel.scrollIntoView({ behavior: 'smooth' });
    }
    refreshPreview();
  };

  // Render different content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'editor':
        return (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Editors */}
            <ResizablePanel
              id="left-panel"
              defaultSize={60}
              minSize={maximizedPanel === 'preview' ? 0 : 30}

            >
              <ResizablePanelGroup direction="vertical" className="h-full">
                {/* Template Editor */}
                <ResizablePanel
                  id="template-panel"
                  defaultSize={50}
                  minSize={maximizedPanel === 'json' ? 0 : 20}
                >
                  <TemplateEditor
                    code={handlebarsCode}
                    onChange={setHandlebarsCode}
                    error={templateError}
                    isReady={isEditorReady}
                    isMaximized={maximizedPanel === 'template'}
                    onToggleMaximize={() => toggleMaximize('template')}
                  />
                </ResizablePanel>

                {maximizedPanel !== 'template' && maximizedPanel !== 'json' && (
                  <ResizableHandle withHandle className="bg-gray-700 hover:bg-gray-600" />
                )}

                {/* JSON Editor */}
                <ResizablePanel
                  id="json-panel"
                  defaultSize={50}
                  minSize={maximizedPanel === 'template' ? 0 : 20}
                >
                  <JsonEditor
                    json={handlebarsJson}
                    onChange={setHandlebarsJson}
                    error={jsonError}
                    isReady={isEditorReady}
                    isMaximized={maximizedPanel === 'json'}
                    onToggleMaximize={() => toggleMaximize('json')}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            {maximizedPanel !== 'template' && maximizedPanel !== 'json' && maximizedPanel !== 'preview' && (
              <ResizableHandle withHandle className="bg-gray-700 hover:bg-gray-600" />
            )}

            {/* Right Panel - Preview */}
            <ResizablePanel
              id="preview-panel"
              defaultSize={40}
              minSize={maximizedPanel === 'template' || maximizedPanel === 'json' ? 0 : 30}

            >
              <PreviewPanel
                preview={handlebarsPreview}
                styles={handlebarsStyles}
                isLoading={isHandlebarsLoading}
                renderCount={renderCount}
                isMaximized={maximizedPanel === 'preview'}
                onToggleMaximize={() => toggleMaximize('preview')}
                onRefresh={refreshPreview}

              />
            </ResizablePanel>
          </ResizablePanelGroup>
        );
      case 'styles':
        return (
          <div className="h-full">
            <StyleEditor
              styles={handlebarsStyles}
              onChange={setHandlebarsStyles}
              error={stylesError}
              isReady={isEditorReady}
              isMaximized={maximizedPanel === 'styles'}
              onToggleMaximize={() => toggleMaximize('styles')}
            />
          </div>
        );
      case 'preview':
        return (
          <div className="h-full">
            <PreviewPanel
              preview={handlebarsPreview}
              styles={handlebarsStyles}
              isLoading={isHandlebarsLoading}
              renderCount={renderCount}
              isMaximized={true}
              onToggleMaximize={() => {}}
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
        onFormatCode={formatCode}
        onGenerateWithAI={generateTemplateWithAI}
        onSave={saveTemplate}
        onRunPreview={runPreview}
        handlebarsCode={handlebarsCode}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content based on active tab */}
      <div className="flex-1">{renderTabContent()}</div>

      {/* Status Bar */}
      <StatusBar lastSaved={lastSaved} />
    </div>
  );
}
