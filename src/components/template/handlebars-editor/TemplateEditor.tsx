'use client';

import { FileCode } from 'lucide-react';
import { useEffect, useRef } from 'react';

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

  const handleCopy = async () => {
    await copyToClipboard(code);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CODE_UPDATED') {
        onChange(event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onChange]);

  const sendInitialCode = () => {
    // console.log('sending initial code', code);
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'INIT_CODE', payload: code },
      '*',
    );
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
          onLoad={sendInitialCode}
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
