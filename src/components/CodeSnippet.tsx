'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'sonner';

import { Button } from './ui/button';

type CodeBlockProps = {
  value: string;
  onChange?: (json: string) => void;
  language?: string;
  isReady?: boolean;
  readOnly?: boolean;
  className?: string;
  lineNumbers?: boolean;
};

export const CodeSnippet = ({ value, language = 'json', lineNumbers = true, className }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Code copied to clipboard!');

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className={`overflow-x-auto rounded-md ${className || ''}`}>
        <SyntaxHighlighter language={language} style={oneDark} showLineNumbers={lineNumbers} wrapLines className="!m-0 !rounded-md">
          {value}
        </SyntaxHighlighter>
      </div>

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
