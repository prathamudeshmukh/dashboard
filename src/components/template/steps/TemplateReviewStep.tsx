'use client';

import { AlertCircle, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

import { CodeSnippet } from '@/components/CodeSnippet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextArea } from '@/components/ui/text-area';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import contentGenerator from '@/service/contentGenerator';
import { EditorTypeEnum } from '@/types/Enum';

type FieldErrors = {
  name: boolean;
  description: boolean;
};

type PreviewStatus = 'idle' | 'generating' | 'ready' | 'error';

export default function TemplateReviewStep() {
  const [compiledHtml, setCompiledHtml] = useState<string>('');
  const [errors, setErrors] = useState<FieldErrors>({ name: false, description: false });
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>('idle');

  const {
    creationMethod,
    templateName,
    templateDescription,
    htmlContent,
    htmlStyle,
    htmlTemplateJson,
    handlebarsCode,
    handlebarTemplateJson,
    activeTab,
    setTemplateName,
    setTemplateDescription,
  } = useTemplateStore();

  useEffect(() => {
    const generate = async () => {
      setPreviewStatus('generating');
      try {
        if (handlebarsCode && handlebarTemplateJson && activeTab === EditorTypeEnum.HANDLEBARS) {
          const parsedJson = JSON.parse(handlebarTemplateJson);
          const result = await contentGenerator({
            templateContent: handlebarsCode,
            templateData: parsedJson,
          });
          setCompiledHtml(result);
          setPreviewStatus('ready');
        } else if (htmlContent && activeTab === EditorTypeEnum.VISUAL) {
          const parsedJson = JSON.parse(htmlTemplateJson);
          const result = await contentGenerator({
            templateContent: htmlContent,
            templateStyle: htmlStyle as string,
            templateData: parsedJson,
          });
          setCompiledHtml(result);
          setPreviewStatus('ready');
        } else {
          setPreviewStatus('idle');
        }
      } catch (err) {
        setCompiledHtml(`<pre style="color: red; padding: 1rem;">Error: ${(err as Error).message}</pre>`);
        setPreviewStatus('error');
      }
    };

    generate();
  }, [handlebarsCode, handlebarTemplateJson, htmlContent, htmlStyle, htmlTemplateJson]);

  const handleNameChange = (value: string) => {
    setTemplateName(value);
    if (value.trim()) {
      setErrors(prev => ({ ...prev, name: false }));
    }
  };

  const handleDescriptionChange = (value: string) => {
    setTemplateDescription(value);
    if (value.trim()) {
      setErrors(prev => ({ ...prev, description: false }));
    }
  };

  const jsonValue
    = activeTab === EditorTypeEnum.HANDLEBARS
      ? (handlebarsCode && handlebarTemplateJson ? handlebarTemplateJson : null)
      : (htmlContent && htmlTemplateJson ? htmlTemplateJson : null);

  return (
    <div className="flex h-[85vh] flex-col lg:flex-row">
      {/* Left panel — form sidebar */}
      <div className="flex min-h-0 w-full shrink-0 flex-col gap-5 overflow-hidden border-r border-gray-100 py-5 pl-3 pr-5 lg:w-[400px]">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Template details
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-1.5 rounded-md bg-gray-50 px-2.5 py-1.5">
          <FileText className="size-3 shrink-0 text-gray-400" />
          <span className="text-[11px] text-gray-500">
            {creationMethod === 'EXTRACT_FROM_PDF' ? 'Extracted from PDF' : 'Gallery template'}
          </span>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-600">
            Name
            {' '}
            <span className="text-red-400">*</span>
          </Label>
          <Input
            data-testid="review-template-name"
            className="h-9 text-sm"
            placeholder="e.g. Monthly Invoice"
            value={templateName}
            onChange={e => handleNameChange(e.target.value)}
            onBlur={() => {
              if (!templateName.trim()) {
                setErrors(prev => ({ ...prev, name: true }));
              }
            }}
          />
          {errors.name && (
            <p className="text-xs text-red-500">Name is required</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-600">
            Description
            {' '}
            <span className="text-red-400">*</span>
          </Label>
          <TextArea
            data-testid="review-template-description"
            className="text-sm"
            rows={2}
            placeholder="What is this template for?"
            value={templateDescription}
            onChange={e => handleDescriptionChange(e.target.value)}
            onBlur={() => {
              if (!templateDescription.trim()) {
                setErrors(prev => ({ ...prev, description: true }));
              }
            }}
          />
          {errors.description && (
            <p className="text-xs text-red-500">Description is required</p>
          )}
        </div>

        {jsonValue && (
          <div className="flex min-h-0 flex-1 flex-col border-t border-gray-100 pt-4">
            <p className="mb-2 shrink-0 text-xs font-medium text-gray-500">Sample data</p>
            <div className="min-h-0 flex-1 overflow-auto rounded-md border border-gray-100">
              <CodeSnippet value={jsonValue} lineNumbers={false} className="w-full text-xs" />
            </div>
          </div>
        )}
      </div>

      {/* Right panel — preview canvas */}
      <div className="relative flex min-h-0 flex-1 flex-col bg-zinc-50">
        {/* Status badge */}
        <div className="absolute right-3 top-3 z-10">
          {previewStatus === 'generating' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] text-gray-500 shadow-sm ring-1 ring-gray-200">
              <span className="inline-block size-1.5 animate-pulse rounded-full bg-amber-400" />
              Rendering…
            </span>
          )}
          {previewStatus === 'error' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] text-red-500 shadow-sm ring-1 ring-red-100">
              <AlertCircle className="size-3" />
              Error
            </span>
          )}
        </div>

        {/* Canvas label */}
        <div className="absolute left-3 top-3 z-10">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Preview
          </span>
        </div>

        {/* Document canvas */}
        <div className="flex min-h-0 flex-1 items-start justify-center overflow-auto px-2 pb-3 pt-10">
          {previewStatus === 'generating' && (
            <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
              <div className="animate-pulse space-y-4 p-8">
                <div className="h-5 w-1/3 rounded-sm bg-gray-100" />
                <div className="h-3 w-full rounded-sm bg-gray-100" />
                <div className="h-3 w-5/6 rounded-sm bg-gray-100" />
                <div className="h-3 w-4/6 rounded-sm bg-gray-100" />
                <div className="mt-4 h-28 rounded-sm bg-gray-100" />
                <div className="h-3 w-full rounded-sm bg-gray-100" />
                <div className="h-3 w-3/4 rounded-sm bg-gray-100" />
                <div className="h-3 w-5/6 rounded-sm bg-gray-100" />
              </div>
            </div>
          )}

          {(previewStatus === 'ready' || previewStatus === 'error') && compiledHtml && (
            <div className="w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
              <iframe
                title="Preview"
                srcDoc={compiledHtml}
                sandbox=""
                className="w-full"
                style={{ height: '80vh', border: 'none', display: 'block' }}
              />
            </div>
          )}

          {previewStatus === 'idle' && (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-full bg-white p-4 shadow-sm ring-1 ring-gray-100">
                <FileText className="size-5 text-gray-300" />
              </div>
              <p className="text-xs text-gray-400">Nothing to preview yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
