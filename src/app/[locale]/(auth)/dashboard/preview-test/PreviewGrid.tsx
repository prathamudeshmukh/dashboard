'use client';

type PreviewItem = {
  fileName: string;
  title: string;
  category: string;
  previewHtml: string | null;
};

function TemplatePreviewCard({ item }: { item: PreviewItem }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="relative h-[200px] overflow-hidden bg-muted">
        {item.previewHtml
          ? (
              <iframe
                srcDoc={item.previewHtml}
                sandbox="allow-same-origin"
                scrolling="no"
                tabIndex={-1}
                title={`Preview: ${item.title}`}
                style={{
                  width: '400%',
                  height: '400%',
                  transform: 'scale(0.25)',
                  transformOrigin: 'top left',
                  pointerEvents: 'none',
                  border: 'none',
                }}
              />
            )
          : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">No preview file found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  src/data/preview/
                  {item.fileName}
                  -preview.html
                </p>
              </div>
            )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium">{item.title}</p>
        <p className="text-xs text-muted-foreground">{item.category}</p>
        <p className="mt-1 text-xs text-muted-foreground/60">{item.fileName}</p>
      </div>
    </div>
  );
}

export function PreviewGrid({ items }: { items: PreviewItem[] }) {
  const found = items.filter(i => i.previewHtml !== null);
  const missing = items.filter(i => i.previewHtml === null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          {found.length}
          {' '}
          preview files found
        </span>
        {missing.length > 0 && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            {missing.length}
            {' '}
            missing
          </span>
        )}
      </div>

      {missing.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2 text-sm font-medium text-amber-800">Missing preview files:</p>
          <ul className="space-y-1">
            {missing.map(i => (
              <li key={i.fileName} className="font-mono text-xs text-amber-700">
                src/data/preview/
                {i.fileName}
                -preview.html
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map(item => (
          <TemplatePreviewCard key={item.fileName} item={item} />
        ))}
      </div>
    </div>
  );
}
