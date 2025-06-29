'use client';

import { Lightbulb } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import { EditorTypeEnum } from '@/types/Enum';
import type { PostMessagePayload, TemplateData } from '@/types/PostMessage';

import EditorSwitchHeader from '../EditorSwitchHeader';
import HTMLBuilder from '../html-builder/HTMLBuilder';

function InfoMessage({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Lightbulb className="text-orange-300" />
      <p className="text-base font-normal text-muted-foreground">{text}</p>
    </div>
  );
}

export default function TemplateEditorStep() {
  const {
    activeTab,
    setActiveTab,
    handlebarsCode,
    handlebarsJson,
    setHandlebarsCode,
    setHandlebarsJson,
  } = useTemplateStore();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingTab, setPendingTab] = useState<EditorTypeEnum | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const locale = useLocale();

  // Send data to iframe
  const sendDataToIframe = (templateData: TemplateData) => {
    try {
      if (!iframeRef.current || !iframeRef.current.contentWindow) {
        console.warn('No iframe found or iframe is not ready to receive data.');
        return;
      }

      const message: PostMessagePayload = {
        type: 'TEMPLATE_DATA_RESPONSE',
        data: templateData,
        source: 'parent',
      };

      iframeRef.current.contentWindow.postMessage(message, '*');
    } catch (err) {
      console.error('Failed to send TEMPLATE_DATA_RESPONSE to iframe:', err);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent<PostMessagePayload>) => {
      try {
        // Optional: verify origin for security
        if (!event.origin.includes(window.location.origin)) {
          console.warn('Message ignored: invalid origin', event.origin);
          return;
        }

        const { type, data, source } = event.data;

        switch (type) {
          case 'IFRAME_LOADED':
            if (source === 'iframe') {
              sendDataToIframe({
                handlebarsCode,
                handlebarsJson,
              });
            }
            break;

          case 'TEMPLATE_UPDATE':
            if (data.handlebarsCode) {
              setHandlebarsCode(data.handlebarsCode);
            }
            if (data.handlebarsJson) {
              setHandlebarsJson(data.handlebarsJson);
            }
            break;

          default:
            break;
        }
      } catch (err) {
        console.error('Error handling postMessage from iframe:', err);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [
    handlebarsCode,
    handlebarsJson,
    setHandlebarsCode,
    setHandlebarsJson,
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

          <TabsContent value={EditorTypeEnum.VISUAL} className="mt-0 border-0 p-0">
            <div className="border-b bg-amber-50/50 p-4">
              <InfoMessage text="Drag and drop elements to build your template visually. Changes here will not affect your Handlebars template." />
            </div>
            <div className="p-4">
              <div className="min-h-[700px]">
                <HTMLBuilder />
              </div>
            </div>
          </TabsContent>

          <TabsContent value={EditorTypeEnum.HANDLEBARS} className="mt-0 border-0 p-0">
            <iframe
              ref={iframeRef}
              key={activeTab}
              title="Template Editor"
              className="min-h-[900px] w-full border-0"
              src={`/${locale}/editor/code-editor`}
              sandbox="allow-same-origin allow-scripts"
            />
          </TabsContent>
        </Tabs>
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
