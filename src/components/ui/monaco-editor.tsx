'use client';

import Editor, { type OnChange, type OnMount } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef } from 'react';

export type MonacoEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language: string;
  theme?: string;
  height?: string | number;
  width?: string | number;
  className?: string;
  loading?: React.ReactNode;
};

export default function MonacoEditor({
  value,
  onChange,
  language,
  theme = 'vs-dark',
  height = '100%',
  width = '100%',
  className = '',
  loading,
}: MonacoEditorProps) {
  const editorRef = useRef<any>(null);

  // Define Handlebars language if it's not already defined
  const defineHandlebarsLanguage = (monaco: any) => {
    if (!monaco.languages.getLanguages().some((lang: any) => lang.id === 'handlebars')) {
      monaco.languages.register({ id: 'handlebars' });

      monaco.languages.setMonarchTokensProvider('handlebars', {
        tokenizer: {
          root: [
            [/\{\{!--[\s\S]*?--\}\}/, 'comment'],
            [/\{\{![\s\S]*?\}\}/, 'comment'],
            [/\{\{/, { token: 'delimiter.curly', next: '@handlebarsInside' }],
            [/[^{]+/, 'text'],
          ],
          handlebarsInside: [
            [/\}\}/, { token: 'delimiter.curly', next: '@pop' }],
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/'([^'\\]|\\.)*$/, 'string.invalid'],
            [/"/, 'string', '@string_double'],
            [/'/, 'string', '@string_single'],
            [/[a-z_$][\w$]*/i, 'variable'],
            [/[[\](),.:]/, 'delimiter'],
            [/#/, 'keyword'],
            [/\//, 'keyword'],
            [/\s+/, 'white'],
          ],
          string_double: [
            [/[^"\\]+/, 'string'],
            [/\\./, 'string.escape'],
            [/"/, 'string', '@pop'],
          ],
          string_single: [
            [/[^'\\]+/, 'string'],
            [/\\./, 'string.escape'],
            [/'/, 'string', '@pop'],
          ],
        },
      });

      monaco.languages.setLanguageConfiguration('handlebars', {
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')'],
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: '\'', close: '\'' },
          { open: '{{', close: '}}' },
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: '\'', close: '\'' },
          { open: '{{', close: '}}' },
        ],
      });
    }
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define Handlebars language
    defineHandlebarsLanguage(monaco);

    // Set initial value
    editor.setValue(value || '');

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
        height={height}
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
          lineNumbers: 'on',
          folding: true,
          wordWrap: 'on',
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
