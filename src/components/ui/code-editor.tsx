'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import Editor from 'react-simple-code-editor';

// We'll load Prism dynamically on the client side
const Prism = {
  languages: {
    extend: () => {},
    markup: {},
    javascript: {},
    jsx: {},
    css: {},
    json: {},
  },
  highlight: (code: any) => code,
};

const defaultStyle: React.CSSProperties = {};

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
  padding?: number;
  style?: React.CSSProperties;
};

export default function CodeEditor({
  value,
  onChange,
  language = 'markup',
  placeholder = '',
  padding = 10,
  style = defaultStyle,
}: CodeEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [prismLoaded, setPrismLoaded] = useState(false);
  const prismRef = useRef<any>(Prism);

  // Load Prism on the client side
  useEffect(() => {
    setMounted(true);

    const loadPrism = async () => {
      try {
        // Dynamically import Prism and its components
        const prismModule = await import('prismjs');

        // Define Handlebars language if not already defined
        if (prismModule.default && !prismModule.default.languages.handlebars) {
          prismModule.default.languages.handlebars = prismModule.default.languages.extend('markup', {
            comment: /\{\{![\s\S]*?\}\}/,
            delimiter: {
              pattern: /^\{\{\{?|\}\}\}?$/,
              alias: 'punctuation',
            },
            string: /(["'])(?:\\.|(?!\1)[^\\\r\n])*\1/,
            number: /\b0x[\dA-Fa-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee][+-]?\d+)?/,
            boolean: /\b(?:true|false)\b/,
            block: {
              pattern: /^(\s*(?:~\s*)?)[#/]\S+?(?=\s*(?:~\s*)?\})/,
              lookbehind: true,
              alias: 'keyword',
            },
            brackets: {
              pattern: /\[[^\]]+\]/,
              inside: {
                punctuation: /\[|\]/,
                variable: /[\s\S]+/,
              },
            },
            punctuation: /[!"#%&':()*+,./;<=>@[\\\]^`{|}~]/,
            variable: /[^!"#%&'()*+,/;<=>@[\\\]^`{|}~\s]+/,
          });
        }

        // Store Prism in ref
        prismRef.current = prismModule.default || prismModule;
        setPrismLoaded(true);

        // Load Prism CSS
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css';
        document.head.appendChild(linkElement);
      } catch (error) {
        console.error('Failed to load Prism:', error);
      }
    };

    loadPrism();
  }, []);

  // Function to highlight code using Prism
  const highlightCode = (code: string) => {
    if (!mounted || !prismLoaded) {
      return code;
    }

    try {
      // Use the appropriate language for highlighting
      const grammar = prismRef.current.languages[language] || prismRef.current.languages.markup;
      return prismRef.current.highlight(code, grammar, language);
    } catch (error) {
      console.error(`Error highlighting code with language ${language}:`, error);
      return code;
    }
  };

  if (!mounted) {
    return (
      <div
        style={{
          ...style,
          padding,
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 14,
        }}
      >
        Loading editor...
      </div>
    );
  }

  return (
    <div className="editor-container size-full" style={{ position: 'relative' }}>
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={highlightCode}
        padding={padding}
        style={{
          ...style,
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 14,
          width: '100%',
          height: '100%', // Remove minHeight here
          overflow: 'auto', // Add overflow handling
        }}
        placeholder={placeholder}
        className="code-editor size-full"
        textareaClassName="focus:outline-none"
      />
    </div>
  );
}
