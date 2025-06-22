'use client';

import { FileCode } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { ErrorMessage } from './ErrorMessage';
import { PanelHeader } from './PanelHeader';
import { copyToClipboard } from './utils';

type TemplateEditorProps = {
  code: string;
  onChange: (code: string) => void;
  error: string;
  isReady: boolean;
};

export function TemplateEditor({ code, onChange, error }: TemplateEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isIframeReady, setIsIframeReady] = useState(false);
  const [pendingCode, setPendingCode] = useState<string>('');

  const handleCopy = async () => {
    await copyToClipboard(code);
  };

  const sendCodeToIframe = (codeToSend: string) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'INIT_CODE', payload: codeToSend },
        '*',
      );
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our iframe
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      if (event.data?.type === 'CODE_UPDATED') {
        onChange(event.data.payload);
      } else if (event.data?.type === 'IFRAME_READY') {
        // Iframe is ready to receive messages
        setIsIframeReady(true);
        // Send any pending code
        if (pendingCode || code) {
          sendCodeToIframe(pendingCode || code);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onChange, code, pendingCode]);

  const sendInitialCode = () => {
    // Store the code to send once iframe is ready
    setPendingCode(code);

    // Try to send immediately in case iframe is already ready
    if (code) {
      sendCodeToIframe(code);
    }
  };

  // Handle external code changes (when parent component updates code)
  useEffect(() => {
    if (isIframeReady && code !== undefined) {
      sendCodeToIframe(code);
    }
  }, [code, isIframeReady]);

  // Reset iframe ready state when iframe reloads
  const handleIframeLoad = () => {
    setIsIframeReady(false);
    sendInitialCode();
  };

  return (
    <div className="flex h-full flex-col">
      <PanelHeader
        title="Handlebars Template"
        icon={<FileCode className="size-3.5 text-gray-400" />}
        onCopy={handleCopy}
      />
      <div className="relative flex-1 overflow-auto">
        <iframe
          ref={iframeRef}
          src="/editor-frame"
          onLoad={handleIframeLoad}
          className="size-full border-0"
          // eslint-disable-next-line react-dom/no-unsafe-iframe-sandbox
          sandbox="allow-same-origin allow-scripts"
          title="Handlebars Template Editor"
        />
      </div>
      <ErrorMessage error={error} />
    </div>
  );
}
