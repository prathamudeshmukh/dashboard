import { useEffect, useRef } from 'react';

type MonacoFrameProps = {
  initialCode: string;
  onCodeChange: (code: string) => void;
};

export default function CodeEditorFrame({ initialCode, onCodeChange }: MonacoFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CODE_UPDATED') {
        onCodeChange(event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onCodeChange]);

  const sendInitialCode = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'INIT_CODE', payload: initialCode },
      '*',
    );
  };

  return (
    <iframe
      ref={iframeRef}
      src="/editor-frame"
      onLoad={sendInitialCode}
      sandbox="allow-scripts allow-same-origin"
      title="Code Editor Frame"
      style={{ width: '100%', height: '700px', border: '1px solid #ccc' }}
    />
  );
}
