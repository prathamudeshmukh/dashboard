/* eslint-disable no-console */
'use client';

import { useEffect, useRef, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { Tabs } from '@/components/ui/tabs';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import { EditorTypeEnum } from '@/types/Enum';
import type { PostMessagePayload, TemplateData } from '@/types/PostMessage';

import EditorSwitchHeader from '../EditorSwitchHeader';

export default function TemplateEditorStep() {
  const {
    activeTab,
    setActiveTab,
    handlebarsCode,
    handlebarsJson,
    htmlContent,
    htmlStyle,
    setHandlebarsCode,
    setHandlebarsJson,
    setHtmlContent,
    setHtmlStyle,
  } = useTemplateStore();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingTab, setPendingTab] = useState<EditorTypeEnum | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Send data to iframe
  const sendDataToIframe = (templateData: TemplateData) => {
    const message: PostMessagePayload = {
      type: 'TEMPLATE_DATA_RESPONSE',
      data: templateData,
      source: 'parent',
    };
    if (!iframeRef.current) {
      return;
    }
    console.debug('TEMPLATE_DATA_RESPONSE emitted:', message);
    iframeRef?.current?.contentWindow?.postMessage(message);
  };

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent<PostMessagePayload>) => {
      // Verify origin for security
      if (!event.origin.includes(window.location.origin)) {
        return;
      }

      const { type, data, source } = event.data;

      switch (type) {
        case 'IFRAME_LOADED':
          if (source === 'iframe') {
            sendDataToIframe({
              handlebarsCode,
              handlebarsJson,
              htmlContent,
              htmlStyle,
            });
          }
          break;

        case 'TEMPLATE_UPDATE':
          // Update parent state with data from iframe
          if (data) {
            if (data.handlebarsCode !== undefined) {
              setHandlebarsCode(data.handlebarsCode);
            }
            if (data.handlebarsJson !== undefined) {
              setHandlebarsJson(data.handlebarsJson);
            }
            if (data.htmlContent !== undefined) {
              setHtmlContent(data.htmlContent);
            }
            if (data.htmlStyle !== undefined) {
              setHtmlStyle(data.htmlStyle);
            }
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [
    handlebarsCode,
    handlebarsJson,
    htmlContent,
    htmlStyle,
    setHandlebarsCode,
    setHandlebarsJson,
    setHtmlContent,
    setHtmlStyle,
  ]);

  const handleTabChange = (tabName: string) => {
    if (tabName !== activeTab) {
      setPendingTab(tabName as EditorTypeEnum);
      setShowConfirmation(true);
    }
  };

  const handleConfirmSwitch = () => {
    if (pendingTab) {
      setActiveTab(pendingTab);
    }
    setShowConfirmation(false);
    setPendingTab(null);
  };

  const handleCancelSwitch = () => {
    setShowConfirmation(false);
    setPendingTab(null);
  };

  return (
    <Card className="w-full border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-2xl font-semibold">Edit Template</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <EditorSwitchHeader activeTab={activeTab} onTabChange={handleTabChange} />
        </Tabs>

        <iframe
          ref={iframeRef}
          key={activeTab}
          title="Template Editor"
          className="min-h-[900px] w-full border-0"
          src={
            activeTab === EditorTypeEnum.VISUAL
              ? '/editor/visual-editor'
              : '/editor/code-editor'
          }
          sandbox="allow-same-origin allow-scripts"
        />
      </CardContent>

      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={handleCancelSwitch}
        onConfirm={handleConfirmSwitch}
        title="Switch Editor?"
        description={`Are you sure you want to switch to the ${pendingTab === EditorTypeEnum.VISUAL ? 'Visual' : 'Code'} Editor? Any unsaved changes in the current editor might be lost or not reflected in the new editor.`}
        confirmText="Yes, Switch"
        cancelText="No, Stay"
      />
    </Card>
  );
}
