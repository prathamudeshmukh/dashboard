'use client';

// Using Monaco Editor version - install with: npm install @monaco-editor/react
import Editor from '@monaco-editor/react';
import { useEffect, useRef, useState } from 'react';

export default function EditorFrame() {
  const [code, setCode] = useState<string>('');
  const [isEditorReady, setIsEditorReady] = useState(false);
  const editorRef = useRef<any>(null);

  // Signal to parent that iframe is ready
  useEffect(() => {
    if (isEditorReady) {
      window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
    }
  }, [isEditorReady]);

  // Handle messages from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'INIT_CODE') {
        const newCode = event.data.payload || '';
        setCode(newCode);

        // Update editor value if editor is ready
        if (editorRef.current && isEditorReady) {
          editorRef.current.setValue(newCode);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isEditorReady]);

  // Send code updates to parent
  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);

    // Post message to parent window
    window.parent.postMessage(
      { type: 'CODE_UPDATED', payload: newCode },
      '*',
    );
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    // Configure editor for Handlebars
    editor.getModel()?.updateOptions({ tabSize: 2 });

    // Set initial code if we have it
    if (code) {
      editor.setValue(code);
    }

    // Mark editor as ready
    setIsEditorReady(true);
  };

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Editor
        height="100%"
        defaultLanguage="html"
        value={code}
        onChange={handleCodeChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          renderLineHighlight: 'line',
          selectOnLineNumbers: true,
          bracketPairColorization: {
            enabled: true,
          },
        }}
      />
    </div>
  );
}
