import fs from 'node:fs/promises';
import path from 'node:path';

import { seedTemplates } from '@/data/template-definitions';

import { PreviewGrid } from './PreviewGrid';

async function loadPreviews() {
  const previewDir = path.join(process.cwd(), 'src', 'data', 'preview');

  return Promise.all(
    seedTemplates.map(async (template) => {
      const filePath = path.join(previewDir, `${template.fileName}-preview.html`);
      try {
        const previewHtml = await fs.readFile(filePath, 'utf8');
        return { ...template, previewHtml };
      } catch {
        return { ...template, previewHtml: null };
      }
    }),
  );
}

export default async function PreviewTestPage() {
  const items = await loadPreviews();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Template Preview Test</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Previews rendered from
          {' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">src/data/preview/*.html</code>
          {' '}
          at 0.25× scale. This page is for local validation only — delete before merging.
        </p>
      </div>
      <PreviewGrid items={items} />
    </div>
  );
}
