'use client';

import Editor, { type OnChange, type OnMount } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import type { LineNumbersProps } from '../template/handlebars-editor/types';

export type MonacoEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language: string;
  theme?: string;
  height?: string | number;
  width?: string | number;
  className?: string;
  loading?: React.ReactNode;
  readonly?: boolean;
  lineNumbers?: LineNumbersProps;
};

export default function MonacoEditor({
  value,
  onChange,
  language,
  theme = 'vs-dark',
  width = '100%',
  className = '',
  loading,
  readonly,
  lineNumbers = 'on',
}: MonacoEditorProps) {
  const editorRef = useRef<any>(null);
  const [editorHeight, setEditorHeight] = useState<number>(150);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;

    editor.setValue(value);

    setEditorHeight(Math.min(editor.getContentHeight(), 350));

    setTimeout(() => {
      editor.getAction('editor.action.formatDocument')?.run();
    }, 100);

    // Focus the editor
    editor.focus();
  };

  const handleEditorChange: OnChange = (value) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  // Update editor value when prop changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== value) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  return (
    <div className={`monaco-editor-container size-full ${className}`}>
      <Editor
        height={editorHeight}
        width={width}
        language={language}
        value={value}
        theme={theme}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
          },
          lineNumbers,
          folding: true,
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
          readOnly: readonly,
        }}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        loading={
          loading || (
            <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
              <Loader2 className="size-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-400">Loading editor...</span>
            </div>
          )
        }
      />
    </div>
  );
}
