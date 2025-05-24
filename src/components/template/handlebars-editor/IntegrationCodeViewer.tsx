'use client';

import { CodeEditorWrapper } from './CodeEditorWrapper';

type IntegrationCodeViewerProps = {
  value: string;
  onChange: (json: string) => void;
  language: string;
  isReady: boolean;
  readOnly: boolean;
};

export function IntegrationCodeViewer({ value, onChange, language, readOnly, isReady }: IntegrationCodeViewerProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-auto rounded-md">
        <CodeEditorWrapper
          value={value}
          onChange={onChange}
          language={language}
          readOnly={readOnly}
          isReady={isReady}
        />
      </div>
    </div>
  );
}
