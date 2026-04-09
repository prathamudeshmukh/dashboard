'use client';

import '@scalar/api-reference-react/style.css';

import dynamic from 'next/dynamic';

import { spec } from '@/openapi/spec';

// Scalar uses browser APIs — SSR must be disabled
const ApiReferenceReact = dynamic(
  () => import('@scalar/api-reference-react').then(mod => mod.ApiReferenceReact),
  { ssr: false, loading: () => <p className="p-8 text-muted-foreground">Loading API reference…</p> },
);

// Maps Templify design tokens to Scalar CSS custom properties.
// Using theme: 'none' so we start from a blank slate and control everything.
const customCss = `
  :root {
    --scalar-font: 'Inter Tight', Inter, system-ui, sans-serif;
    --scalar-font-code: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

    --scalar-color-1: #0a0a0a;
    --scalar-color-2: #3f3f46;
    --scalar-color-3: #71717a;
    --scalar-color-accent: #161676;

    --scalar-background-1: #ffffff;
    --scalar-background-2: #f8fafc;
    --scalar-background-3: #f1f5f9;
    --scalar-background-accent: #eef2ff;

    --scalar-border-color: #e4e4e7;
    --scalar-border-radius: 6px;

    --scalar-sidebar-background-1: #ffffff;
    --scalar-sidebar-color-1: #0a0a0a;
    --scalar-sidebar-color-2: #71717a;
    --scalar-sidebar-color-active: #161676;
    --scalar-sidebar-background-active: #eef2ff;
    --scalar-sidebar-border-color: #e4e4e7;

    --scalar-color-green: #16a34a;
    --scalar-color-red: #dc2626;
    --scalar-color-yellow: #d97706;
    --scalar-color-blue: #161676;
    --scalar-color-orange: #ea580c;
    --scalar-color-purple: #7c3aed;
  }
`;

export default function ApiReferencePage() {
  return (
    <div className="w-full">
      <ApiReferenceReact
        configuration={{
          content: spec,
          theme: 'none',
          layout: 'modern',
          showSidebar: false,
          withDefaultFonts: false,
          forceDarkModeState: 'light',
          hideDarkModeToggle: true,
          hideModels: false,
          customCss,
        }}
      />
    </div>
  );
}
