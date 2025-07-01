'use client';

import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import React, { useEffect, useRef } from 'react';

const HandleBarEditPage = () => {
  const locale = useLocale();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');

  // Send data to iframe
  const sendDataToIframe = (templateId: string) => {
    try {
      if (!iframeRef.current || !iframeRef.current.contentWindow) {
        console.warn('No iframe found or iframe is not ready to receive data.');
        return;
      }

      const message = {
        type: 'TEMPLATE_ID_RESPONSE',
        data: templateId,
        source: 'parent',
      };

      iframeRef.current.contentWindow.postMessage(message, '*');
    } catch (err) {
      console.error('Failed to send TEMPLATE_DATA_RESPONSE to iframe:', err);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        // Optional: verify origin for security
        if (!event.origin.includes(window.location.origin)) {
          console.warn('Message ignored: invalid origin', event.origin);
          return;
        }

        const { type, source } = event.data;

        switch (type) {
          case 'IFRAME_LOADED':
            if (source === 'iframe') {
              sendDataToIframe(templateId as string);
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
  }, [templateId]);

  return (
    <div>
      <iframe
        ref={iframeRef}
        title="Handlebar Editor"
        className="min-h-[900px] w-full border-0"
        src={`/${locale}/editor/code-editor`}
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
};

export default HandleBarEditPage;
