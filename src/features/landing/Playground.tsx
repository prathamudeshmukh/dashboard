'use client';

import { useClerk } from '@clerk/nextjs';
import { ChevronDown, ChevronUp, Download, Loader2, Sparkles } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { JsonEditor } from '@/components/template/handlebars-editor/JsonEditor';
import { PreviewPanel } from '@/components/template/handlebars-editor/PreviewPanel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fetchTemplatesFromGallery } from '@/libs/actions/templates';
import { trackEvent } from '@/libs/analytics/trackEvent';
import { HandlebarsService } from '@/libs/services/HandlebarService';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import type { TemplateGalleryGroup, TemplateGalleryVariant } from '@/types/Template';
import { groupTemplatesByTypeKey } from '@/utils/templateGallery';

const handlebarsService = new HandlebarsService();
const MAX_FEATURED_TEMPLATES = 5;

type TemplateSetters = {
  selectTemplate: (id: string) => void;
  setTemplateName: (name: string) => void;
  setTemplateDescription: (desc: string) => void;
  setHtmlContent: (content: string) => void;
  setHandlebarsCode: (code: string) => void;
  setHtmlTemplateJson: (json: string) => void;
  setHandlebarTemplateJson: (json: string) => void;
};

function selectVariantIntoStore(
  variant: TemplateGalleryVariant,
  group: TemplateGalleryGroup,
  setters: TemplateSetters,
) {
  setters.selectTemplate(variant.id);
  setters.setTemplateName(group.title);
  setters.setTemplateDescription(group.description ?? '');
  setters.setHtmlContent(variant.htmlContent);
  setters.setHandlebarsCode(variant.handlebarContent ?? '');
  setters.setHtmlTemplateJson(JSON.stringify(variant.sampleData, null, 2));
  setters.setHandlebarTemplateJson(JSON.stringify(variant.sampleData, null, 2));
}

export default function Playground() {
  const locale = useLocale();
  const { openSignUp } = useClerk();

  const {
    selectedTemplate,
    templateName,
    handlebarsCode,
    handlebarTemplateJson,
    setHandlebarTemplateJson,
    templateGallery,
    setTemplateGallery,
    selectTemplate,
    setTemplateName,
    setTemplateDescription,
    setHtmlContent,
    setHandlebarsCode,
    setHtmlTemplateJson,
  } = useTemplateStore();

  const setters: TemplateSetters = {
    selectTemplate,
    setTemplateName,
    setTemplateDescription,
    setHtmlContent,
    setHandlebarsCode,
    setHtmlTemplateJson,
    setHandlebarTemplateJson,
  };

  const [groups, setGroups] = useState<TemplateGalleryGroup[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [htmlPreview, setHtmlPreview] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [renderCount, setRenderCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [hasCustomizedData, setHasCustomizedData] = useState(false);

  const handleDataChange = (json: string) => {
    setHasCustomizedData(true);
    setHandlebarTemplateJson(json);
  };

  const sectionRef = useRef<HTMLElement>(null);
  const renderStartRef = useRef<number>(0);

  // Load gallery templates and auto-select the first one
  useEffect(() => {
    const load = async () => {
      setIsLoadingTemplates(true);
      try {
        let data = templateGallery;
        if (!data) {
          data = await fetchTemplatesFromGallery();
          setTemplateGallery(data);
        }
        const loaded = groupTemplatesByTypeKey(data);
        setGroups(loaded);

        // Auto-select first template so the preview renders immediately
        const firstGroup = loaded[0];
        const firstVariant = firstGroup?.variants[0];
        if (firstGroup && firstVariant && !selectedTemplate) {
          selectVariantIntoStore(firstVariant, firstGroup, setters);
        }
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    load();
  // Intentionally runs once on mount — auto-selects the first template
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fire playground_section_viewed once when the section enters the viewport
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          trackEvent('playground_section_viewed', {
            device_type: window.innerWidth < 768 ? 'mobile' : 'desktop',
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Re-render preview when template code or data changes
  useEffect(() => {
    if (!handlebarsCode) {
      return;
    }

    let cancelled = false;
    setIsPreviewLoading(true);
    renderStartRef.current = performance.now();

    handlebarsService
      .renderTemplate(handlebarsCode, handlebarTemplateJson)
      .then((result) => {
        if (!cancelled) {
          setHtmlPreview(result);
          setRenderCount((n) => {
            if (n === 0) {
              trackEvent('playground_preview_rendered', {
                template_name: templateName,
                gallery_template_id: selectedTemplate ?? '',
                render_time_ms: Math.round(performance.now() - renderStartRef.current),
              });
            }
            return n + 1;
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsPreviewLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [handlebarsCode, handlebarTemplateJson]);

  const handleTemplateSwitch = (group: TemplateGalleryGroup) => {
    const variant = group.variants[0];
    if (!variant) {
      return;
    }
    trackEvent('playground_template_switched', {
      template_name: group.title,
      gallery_template_id: variant.id,
      from_template_name: templateName || undefined,
    });
    setRenderCount(0);
    setHasCustomizedData(false);
    selectVariantIntoStore(variant, group, setters);
  };

  const handleRefreshPreview = async () => {
    if (!handlebarsCode) {
      return;
    }
    setIsPreviewLoading(true);
    try {
      const result = await handlebarsService.renderTemplate(handlebarsCode, handlebarTemplateJson);
      setHtmlPreview(result);
      setRenderCount(n => n + 1);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedTemplate) {
      return;
    }
    setIsDownloading(true);
    try {
      let parsedData: Record<string, unknown> = {};
      try {
        parsedData = JSON.parse(handlebarTemplateJson);
      } catch {
        // fall through with empty data
      }

      const prefix = locale === 'en' ? '' : `/${locale}`;
      const res = await fetch(`${prefix}/api/playground/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ galleryTemplateId: selectedTemplate, templateData: parsedData }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Unknown error' }));
        const errorCode
          = res.status === 429
            ? 'rate_limited'
            : res.status === 503
              ? 'service_unavailable'
              : 'unknown';
        trackEvent('playground_pdf_download_failed', {
          gallery_template_id: selectedTemplate,
          template_name: templateName,
          error_code: errorCode,
        });
        if (res.status === 429) {
          toast.error('Too many requests. Please wait a few minutes.');
        } else if (res.status === 503) {
          toast.error('PDF service is temporarily unavailable. Try again shortly.');
        } else {
          toast.error(body.error ?? 'Failed to generate PDF.');
        }
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.pdf';
      a.click();
      URL.revokeObjectURL(url);

      trackEvent('playground_pdf_downloaded', {
        gallery_template_id: selectedTemplate,
        template_name: templateName,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const featuredGroups = groups.slice(0, MAX_FEATURED_TEMPLATES);
  const isGroupActive = (group: TemplateGalleryGroup) =>
    group.variants.some(v => v.id === selectedTemplate);

  return (
    <section ref={sectionRef} id="playground" className="bg-[#F8F8FA] py-24">
      <div className="container px-5 md:px-0">

        {/* Section header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="size-3.5" />
            Live playground
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            See Templify in action
          </h2>
          <p className="mt-3 text-base text-gray-500">
            Pick a template, preview it live, and download a real PDF — no signup needed.
          </p>
        </div>

        {/* Compact template switcher */}
        {!isLoadingTemplates && featuredGroups.length > 0 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {featuredGroups.map(group => (
              <button
                key={group.typeKey}
                type="button"
                onClick={() => handleTemplateSwitch(group)}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
                  isGroupActive(group)
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-primary/40 hover:text-primary',
                )}
              >
                {group.title}
              </button>
            ))}
          </div>
        )}

        {/* Main layout: controls left, preview right */}
        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">

          {/* Left panel */}
          <div className="flex flex-col gap-4">

            {/* Active template label */}
            {templateName && (
              <div className="rounded-xl border bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Template
                </p>
                <p className="mt-0.5 font-semibold text-gray-900">{templateName}</p>
              </div>
            )}

            {/* Collapsible JSON editor */}
            <div className="overflow-hidden rounded-xl border bg-white">
              <button
                type="button"
                onClick={() => {
                  if (!isEditorOpen) {
                    trackEvent('playground_data_editor_opened', { template_name: templateName });
                  }
                  setIsEditorOpen(v => !v);
                }}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <span>Customize sample data</span>
                {isEditorOpen
                  ? <ChevronUp className="size-4 text-gray-400" />
                  : <ChevronDown className="size-4 text-gray-400" />}
              </button>
              {isEditorOpen && (
                <div className="h-[280px] border-t">
                  <JsonEditor
                    json={handlebarTemplateJson}
                    onChange={handleDataChange}
                    error=""
                    isReady
                  />
                </div>
              )}
            </div>

            {/* CTA card — always visible, the primary conversion surface */}
            <div className="rounded-xl border bg-white p-5">
              <p className="font-semibold text-gray-900">
                Ready to use your own data?
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                Connect your own templates and generate PDFs via API — with one HTTP call per document.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Button
                  className="w-full rounded-full"
                  onClick={() => {
                    trackEvent('playground_signup_cta_clicked', {
                      template_name: templateName,
                      gallery_template_id: selectedTemplate ?? '',
                      had_customized_data: hasCustomizedData,
                    });
                    openSignUp({ afterSignUpUrl: '/dashboard' });
                  }}
                >
                  Start free — 150 credits included
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={handleDownload}
                  disabled={isDownloading || !selectedTemplate}
                >
                  {isDownloading
                    ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Generating PDF...
                        </>
                      )
                    : (
                        <>
                          <Download className="mr-2 size-4" />
                          Download this PDF
                        </>
                      )}
                </Button>
              </div>
              <p className="mt-3 text-center text-xs text-gray-400">
                No credit card required
              </p>
            </div>

          </div>

          {/* Right panel: PDF preview — the hero of this section */}
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            {/* Fake browser chrome for polish */}
            <div className="flex items-center gap-3 border-b bg-gray-50 px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="block size-3 rounded-full bg-red-400" />
                <span className="block size-3 rounded-full bg-yellow-400" />
                <span className="block size-3 rounded-full bg-green-400" />
              </div>
              <span className="text-xs text-gray-400">Live preview</span>
            </div>
            <div className="h-[540px]">
              <PreviewPanel
                preview={htmlPreview}
                isLoading={isPreviewLoading}
                renderCount={renderCount}
                onRefresh={handleRefreshPreview}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
