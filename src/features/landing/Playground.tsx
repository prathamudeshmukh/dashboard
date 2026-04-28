'use client';

import { SignUpButton } from '@clerk/nextjs';
import { Download, Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { JsonEditor } from '@/components/template/handlebars-editor/JsonEditor';
import { PreviewPanel } from '@/components/template/handlebars-editor/PreviewPanel';
import TemplateGallery from '@/components/template/TemplateGallery';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/libs/analytics/trackEvent';
import { HandlebarsService } from '@/libs/services/HandlebarService';
import { useTemplateStore } from '@/libs/store/TemplateStore';

const handlebarsService = new HandlebarsService();

export default function Playground() {
  const locale = useLocale();

  const {
    selectedTemplate,
    templateName,
    handlebarsCode,
    handlebarTemplateJson,
    setHandlebarTemplateJson,
  } = useTemplateStore();

  const [htmlPreview, setHtmlPreview] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [renderCount, setRenderCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showCta, setShowCta] = useState(false);

  // Re-render preview whenever the template content or JSON data changes
  useEffect(() => {
    if (!handlebarsCode) {
      return;
    }

    let cancelled = false;

    const render = async () => {
      setIsPreviewLoading(true);
      try {
        const result = await handlebarsService.renderTemplate(handlebarsCode, handlebarTemplateJson);
        if (!cancelled) {
          setHtmlPreview(result);
          setRenderCount(n => n + 1);
        }
      } finally {
        if (!cancelled) {
          setIsPreviewLoading(false);
        }
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [handlebarsCode, handlebarTemplateJson]);

  const refreshPreview = async () => {
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
        // use empty data if JSON is malformed
      }

      const prefix = locale === 'en' ? '' : `/${locale}`;
      const res = await fetch(`${prefix}/api/playground/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryTemplateId: selectedTemplate,
          templateData: parsedData,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Unknown error' }));
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

      setShowCta(true);
    } finally {
      setIsDownloading(false);
    }
  };

  const templateSelected = Boolean(selectedTemplate);

  return (
    <section id="playground" className="bg-white py-20">
      <div className="container px-5 md:px-0">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Generate a PDF right now — no account needed
          </h2>
          <p className="mt-3 text-base text-gray-500">
            Pick a template, adjust the sample data, and download a real PDF in seconds.
          </p>
        </div>

        {/* Step 1: Gallery picker */}
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
            1. Pick a template
          </p>
          <TemplateGallery
            onUseAsIs={() => { }}
            onCustomize={() => { }}
          />
        </div>

        {/* Steps 2 + 3: Editor + Preview + Download (only shown after selection) */}
        {templateSelected && (
          <>
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              {/* Step 2: JSON data editor */}
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
                  2. Edit sample data (optional)
                </p>
                <div className="h-[380px] overflow-hidden rounded-lg border">
                  <JsonEditor
                    json={handlebarTemplateJson}
                    onChange={setHandlebarTemplateJson}
                    error=""
                    isReady
                  />
                </div>
              </div>

              {/* Step 3: Live preview */}
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
                  3. Preview
                </p>
                <div className="h-[380px] overflow-hidden rounded-lg border">
                  <PreviewPanel
                    preview={htmlPreview}
                    isLoading={isPreviewLoading}
                    renderCount={renderCount}
                    onRefresh={refreshPreview}
                  />
                </div>
              </div>
            </div>

            {/* Download button */}
            <div className="flex flex-col items-center gap-4">
              <Button
                size="lg"
                className="rounded-full px-8"
                onClick={handleDownload}
                disabled={isDownloading}
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
                        Download PDF
                      </>
                    )}
              </Button>

              {/* Soft sign-up CTA shown after first download */}
              {showCta && (
                <div className="mt-2 flex flex-col items-center gap-2 text-center">
                  <p className="text-sm text-gray-500">
                    Want to use your own data and save templates?
                  </p>
                  <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                    <Button variant="outline" className="rounded-full">
                      Sign up free →
                    </Button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
