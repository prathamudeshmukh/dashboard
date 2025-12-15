'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { IntegrationCodeViewer } from './template/handlebars-editor/IntegrationCodeViewer';
import type { LineNumbersProps } from './template/handlebars-editor/types';
import { Button } from './ui/button';

type CodeBlockProps = {
  value: string;
  onChange?: (json: string) => void;
  language?: string;
  isReady?: boolean;
  readOnly?: boolean;
  className?: string;
  lineNumbers?: LineNumbersProps;
};

export const CodeSnippet = ({ value, onChange, language = 'json', lineNumbers, isReady = true, readOnly = true, className }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Code copied to clipboard!');

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative ${className || ''}`}>
      <IntegrationCodeViewer readOnly={readOnly} value={value} isReady={isReady} lineNumbers={lineNumbers} language={language} onChange={onChange ?? (() => {})} />

      <Button
        size="sm"
        variant="outline"
        className="absolute right-4 top-2 z-10"
        onClick={handleCopy}
      >
        {copied
          ? (
              <Check className="size-4" />
            )
          : (
              <Copy className="size-4" />
            )}
      </Button>
    </div>
  );
};
