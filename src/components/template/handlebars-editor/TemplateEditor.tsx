'use client';

import { FileCode } from 'lucide-react';

import { CodeEditorWrapper } from './CodeEditorWrapper';
import { ErrorMessage } from './ErrorMessage';
import { PanelHeader } from './PanelHeader';
import { copyToClipboard } from './utils';

type TemplateEditorProps = {
  code: string;
  onChange: (code: string) => void;
  error: string;
  isReady: boolean;
};

export function TemplateEditor({ code, onChange, error, isReady }: TemplateEditorProps) {
  const handleCopy = async () => {
    await copyToClipboard(code);
  };

  return (
    <div className="flex h-full flex-col">
      <PanelHeader
        title="Handlebars Template"
        icon={<FileCode className="size-3.5 text-gray-400" />}
        onCopy={handleCopy}
      />
      <div className="relative flex-1 overflow-auto">
        <CodeEditorWrapper
          value={code}
          onChange={onChange}
          language="html"
          isReady={isReady}
        />
      </div>
      <ErrorMessage error={error} />
    </div>
  );
}
