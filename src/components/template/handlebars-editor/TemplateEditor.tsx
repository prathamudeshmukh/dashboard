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
  isMaximized: boolean;
  onToggleMaximize: () => void;
};

export function TemplateEditor({ code, onChange, error, isReady, isMaximized, onToggleMaximize }: TemplateEditorProps) {
  const handleCopy = async () => {
    await copyToClipboard(code);
  };

  return (
    <div className="flex h-full flex-col">
      <PanelHeader
        title="TEMPLATE.HBS"
        icon={<FileCode className="size-3.5 text-gray-400" />}
        isMaximized={isMaximized}
        onCopy={handleCopy}
        onToggleMaximize={onToggleMaximize}
      />
      <div className="relative flex-1 overflow-auto" style={{ minHeight: '200px' }}>
        <CodeEditorWrapper
          value={code}
          onChange={onChange}
          language="handlebars"
          isReady={isReady}
        />
      </div>
      <ErrorMessage error={error} />
    </div>
  );
}
