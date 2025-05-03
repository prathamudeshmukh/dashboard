'use client';

import { Braces } from 'lucide-react';

import { CodeEditorWrapper } from './CodeEditorWrapper';
import { ErrorMessage } from './ErrorMessage';
import { PanelHeader } from './PanelHeader';
import { copyToClipboard } from './utils';

type JsonEditorProps = {
  json: string;
  onChange: (json: string) => void;
  error: string;
  isReady: boolean;
  isMaximized: boolean;
  onToggleMaximize: () => void;
};

export function JsonEditor({ json, onChange, error, isReady, isMaximized, onToggleMaximize }: JsonEditorProps) {
  const handleCopy = async () => {
    await copyToClipboard(json);
  };

  return (
    <div className="flex h-full flex-col">
      <PanelHeader
        title="Sample Input JSON"
        icon={<Braces className="size-3.5 text-gray-400" />}
        isMaximized={isMaximized}
        onCopy={handleCopy}
        onToggleMaximize={onToggleMaximize}
      />
      <div className="relative flex-1 overflow-auto">
        <CodeEditorWrapper
          value={json}
          onChange={onChange}
          language="json"
          isReady={isReady}
        />
      </div>
      <ErrorMessage error={error} type="json" />
    </div>
  );
}
