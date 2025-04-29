import type React from 'react';
// Types for the Handlebars Editor components
export type PanelType = 'none' | 'template' | 'json' | 'preview' | 'styles';

export type PanelSizes = {
  leftPanel: number;
  templatePanel: number;
  jsonPanel: number;
  stylesPanel?: number;
};

export type EditorProps = {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
  isReady: boolean;
};

export type PanelHeaderProps = {
  title: string;
  icon: React.ReactNode;
  isMaximized: boolean;
  onCopy: () => void;
  onToggleMaximize: () => void;
  additionalInfo?: React.ReactNode;
};

export type ErrorMessageProps = {
  error: string;
  type?: 'template' | 'json' | 'styles';
};
