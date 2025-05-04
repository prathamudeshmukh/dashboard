'use client';

import { Paintbrush } from 'lucide-react';

import { CodeEditorWrapper } from './CodeEditorWrapper';
import { ErrorMessage } from './ErrorMessage';
import { PanelHeader } from './PanelHeader';
import { copyToClipboard } from './utils';

type StyleEditorProps = {
  styles: string;
  onChange: (styles: string) => void;
  error: string;
  isReady: boolean;
};

export function StyleEditor({ styles, onChange, error, isReady }: StyleEditorProps) {
  const handleCopy = async () => {
    await copyToClipboard(styles);
  };

  return (
    <div className="flex h-full flex-col">
      <PanelHeader
        title="STYLES.CSS"
        icon={<Paintbrush className="size-3.5 text-gray-400" />}
        onCopy={handleCopy}
      />
      <div className="relative flex-1 overflow-auto">
        <CodeEditorWrapper
          value={styles}
          onChange={onChange}
          language="css"
          placeholder="Enter your CSS styles here..."
          isReady={isReady}
        />
      </div>
      <ErrorMessage error={error} type="styles" />
    </div>
  );
}
