'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { Button } from './ui/button';

type CodeBlockProps = {
  code: string;
  className?: string;
};

export const CodeSnippet = ({ code, className }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className={`overflow-x-auto rounded-md bg-muted p-4 text-sm ${className || ''}`}>
        <code>{code}</code>
      </pre>

      <Button
        variant="ghost"
        size="sm"
        className="absolute right-4 top-2"
        onClick={handleCopy}
      >
        {copied
          ? (
              <>
                <Check className="mr-1 size-4" />
                Copied
              </>
            )
          : (
              <>
                <Copy className="mr-1 size-4" />
                Copy
              </>
            )}
      </Button>
    </div>
  );
};
