import type React from 'react';
// Types for the Handlebars Editor components

export type EditorProps = {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
  isReady: boolean;
  readOnly?: boolean;
};

export type PanelHeaderProps = {
  title: string;
  icon: React.ReactNode;
  onCopy?: () => void;
  additionalInfo?: React.ReactNode;
};

export type ErrorMessageProps = {
  error: string;
  type?: 'template' | 'json' | 'styles';
};
