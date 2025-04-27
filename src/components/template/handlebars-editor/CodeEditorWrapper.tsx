'use client';

import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { EditorProps } from './types';

// Dynamically import CodeEditor to avoid SSR issues
const CodeEditor = dynamic(() => import('@/components/ui/code-editor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-muted/20 p-4">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">Loading editor...</span>
    </div>
  ),
});

export function CodeEditorWrapper({ value, onChange, language, placeholder, isReady }: EditorProps) {
  if (!isReady) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Loading editor...</span>
      </div>
    );
  }

  return (
    <CodeEditor
      value={value}
      onChange={onChange}
      language={language}
      placeholder={placeholder}
      padding={16}
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 14,
        height: '100%',
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
      }}
    />
  );
}
