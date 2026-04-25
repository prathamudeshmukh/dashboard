import type * as Icons from 'lucide-react';
import { Edit2, Search, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { cn } from '@/lib/utils';
import { fetchTemplatesFromGallery } from '@/libs/actions/templates';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import type { TemplateGalleryProps } from '@/types/Template';

import { DynamicLucideIcon } from '../DynamicIcon';
import { Button } from '../ui/button';

const TAILWIND_COLOR_MAP: Record<string, string> = {
  'text-blue-600': '#2563eb',
  'text-green-600': '#16a34a',
  'text-amber-600': '#d97706',
  'text-purple-600': '#9333ea',
  'text-slate-600': '#475569',
  'text-yellow-600': '#ca8a04',
  'text-emerald-600': '#059669',
  'text-indigo-600': '#4f46e5',
  'text-sky-600': '#0284c7',
  'text-rose-600': '#e11d48',
  'text-red-600': '#dc2626',
  'text-orange-600': '#ea580c',
  'text-teal-600': '#0d9488',
  'text-cyan-600': '#0891b2',
  'text-pink-600': '#db2777',
  'text-violet-600': '#7c3aed',
  'text-lime-600': '#65a30d',
  'text-fuchsia-600': '#c026d3',
};

const getCategoryColor = (color: string | null): string =>
  color ? (TAILWIND_COLOR_MAP[color] ?? '#161676') : '#161676';

type TemplateGalleryCallbacks = {
  onUseAsIs: () => void;
  onCustomize: () => void;
};

export default function TemplateGallery({ onUseAsIs, onCustomize }: TemplateGalleryCallbacks) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [templates, setTemplates] = useState<TemplateGalleryProps[]>([]);
  const {
    selectTemplate,
    templateGallery,
    setTemplateName,
    setTemplateDescription,
    setHtmlContent,
    setHtmlTemplateJson,
    setHandlebarsCode,
    setHandlebarTemplateJson,
    setTemplateGallery,
  } = useTemplateStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      try {
        if (templateGallery) {
          setTemplates(templateGallery);
        } else {
          const data = await fetchTemplatesFromGallery();
          setTemplates(data);
          setTemplateGallery(data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [templateGallery, setTemplateGallery]);

  const categories = ['All', ...new Set(templates.map(template => template.category))];

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch
        = searchTerm === ''
        || template.title.toLowerCase().includes(searchTerm.toLowerCase())
        || template?.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchTerm, selectedCategory]);

  function handleTemplateSelect(template: TemplateGalleryProps) {
    if (!template) {
      return;
    }
    selectTemplate(template.id);
    setTemplateName(template.title);
    setTemplateDescription(template?.description as string);
    setHtmlContent(template.htmlContent);
    setHandlebarsCode(template.handlebarContent as string);
    setHtmlTemplateJson(JSON.stringify(template.sampleData as string, null, 2));
    setHandlebarTemplateJson(JSON.stringify(template.sampleData as string, null, 2));
  }

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search and filter controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search templates..."
            className="h-9 w-full rounded-full border border-border bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category as string)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200',
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground',
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable template area */}
      <div className="h-[520px] overflow-y-auto pr-1">
        {/* Loading skeleton */}
        {isLoading
          ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse overflow-hidden rounded-xl border bg-card">
                    <div className="h-[200px] bg-muted/60" />
                    <div className="space-y-3 p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-lg bg-muted/60" />
                        <div className="h-4 w-2/3 rounded-md bg-muted/60" />
                      </div>
                      <div className="h-3 w-full rounded bg-muted/40" />
                      <div className="h-3 w-4/5 rounded bg-muted/40" />
                    </div>
                    <div className="flex gap-2 border-t px-4 py-3">
                      <div className="h-8 flex-1 rounded-full bg-muted/60" />
                      <div className="h-8 flex-1 rounded-full bg-muted/40" />
                    </div>
                  </div>
                ))}
              </div>
            )
          : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredTemplates.map((template, index) => {
                    const accentColor = getCategoryColor(template.color);
                    return (
                      <div
                        data-testid="template-card"
                        key={template.id}
                        className="animate-slide-up-fade group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/[0.06]"
                        style={{ animationDelay: `${index * 55}ms` }}
                      >
                        {/* Preview area */}
                        <div className="relative h-[200px] shrink-0 overflow-hidden bg-muted">
                          {template.previewHtmlContent
                            ? (
                                <iframe
                                  srcDoc={template.previewHtmlContent}
                                  sandbox="allow-same-origin"
                                  scrolling="no"
                                  tabIndex={-1}
                                  title={`Preview: ${template.title}`}
                                  data-testid="template-preview-iframe"
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
                                <div
                                  data-testid="template-preview-placeholder"
                                  className="size-full bg-muted"
                                />
                              )}

                          {/* Hover gradient overlay */}
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                          {/* Category badge */}
                          {template.category && (
                            <div className="absolute right-3 top-3">
                              <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-foreground/75 shadow-sm backdrop-blur-sm">
                                {template.category}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card body */}
                        <div className="flex flex-1 flex-col p-4">
                          <div className="mb-2 flex items-center gap-2.5">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <DynamicLucideIcon
                                name={template.icon as keyof typeof Icons}
                                color={accentColor}
                              />
                            </div>
                            <h3
                              data-testid="template-name"
                              className="font-semibold leading-snug text-foreground"
                            >
                              {template.title}
                            </h3>
                          </div>
                          <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
                            {template.description}
                          </p>
                        </div>

                        {/* Footer actions */}
                        <div className="flex gap-2 border-t px-4 py-3">
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1 rounded-full text-sm font-medium"
                            onClick={() => {
                              handleTemplateSelect(template);
                              onUseAsIs();
                            }}
                          >
                            <Zap className="mr-1.5 size-3.5" />
                            Use as-is
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-full text-sm font-medium"
                            onClick={() => {
                              handleTemplateSelect(template);
                              onCustomize();
                            }}
                          >
                            <Edit2 className="mr-1.5 size-3.5" />
                            Customize
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Empty state */}
                {filteredTemplates.length === 0 && (searchTerm || selectedCategory !== 'All') && (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                      <Search className="size-7 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground">No templates found</p>
                    <p className="text-sm text-muted-foreground">
                      Try a different search term or category.
                    </p>
                    <Button variant="link" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  </div>
                )}
              </>
            )}
      </div>
    </div>
  );
}
