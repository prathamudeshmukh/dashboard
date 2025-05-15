'use client';

import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { EditorProps } from './types';

// Dynamically import CodeEditor to avoid SSR issues
const CodeEditor = dynamic(() => import('@/components/ui/monaco-editor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-muted/20 p-4">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">Loading editor...</span>
    </div>
  ),
});

export function CodeEditorWrapper({ value, onChange, language, isReady }: EditorProps) {
  if (!isReady) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Loading editor...</span>
      </div>
    );
  }

  return (
    <div className="h-[350px]">
      <CodeEditor
        value={value}
        onChange={onChange}
        language={language}
      />
    </div>
  );
}
