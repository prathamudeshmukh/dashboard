'use client';

import { useEffect, useState } from 'react';

import { CodeSnippet } from '@/components/CodeSnippet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function TemplateReviewStep() {
  const [compiledHtml, setCompiledHtml] = useState<string>('');
  const [errors, setErrors] = useState<FieldErrors>({ name: false, description: false });

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
      try {
        if (handlebarsCode && handlebarTemplateJson && activeTab === EditorTypeEnum.HANDLEBARS) {
          const parsedJson = JSON.parse(handlebarTemplateJson);
          const result = await contentGenerator({
            templateContent: handlebarsCode,
            templateData: parsedJson,
          });
          setCompiledHtml(result);
        } else if (htmlContent && activeTab === EditorTypeEnum.VISUAL) {
          const parsedJson = JSON.parse(htmlTemplateJson);
          const result = await contentGenerator({
            templateContent: htmlContent,
            templateStyle: htmlStyle as string,
            templateData: parsedJson,
          });
          setCompiledHtml(result);
        }
      } catch (err) {
        setCompiledHtml(`<pre style="color: red;">Error: ${(err as Error).message}</pre>`);
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

  const jsonValue = activeTab === EditorTypeEnum.HANDLEBARS
    ? (handlebarsCode && handlebarTemplateJson ? handlebarTemplateJson : null)
    : (htmlContent && htmlTemplateJson ? htmlTemplateJson : null);

  return (
    <div className="flex h-[80vh] flex-col gap-3 lg:flex-row">
      {/* Left Column: Details + JSON */}
      <div className="flex h-full flex-1 flex-col gap-3 overflow-hidden">
        <Card className="shrink-0">
          <CardHeader className="px-4 py-3">
            <CardTitle className="text-base font-medium">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4">
            <p className="text-sm">
              <span className="font-semibold">Type:</span>
              {' '}
              {creationMethod}
            </p>

            <div className="grid gap-1">
              <Label className="text-sm font-normal">Name</Label>
              <Input
                data-testid="review-template-name"
                className="h-8 text-sm"
                value={templateName}
                onChange={e => handleNameChange(e.target.value)}
                onBlur={() => {
                  if (!templateName.trim()) {
                    setErrors(prev => ({ ...prev, name: true }));
                  }
                }}
              />
              {errors.name && (
                <p className="text-xs text-destructive">Name is required</p>
              )}
            </div>

            <div className="grid gap-1">
              <Label className="text-sm font-normal">Description</Label>
              <TextArea
                data-testid="review-template-description"
                className="text-sm"
                rows={3}
                value={templateDescription}
                onChange={e => handleDescriptionChange(e.target.value)}
                onBlur={() => {
                  if (!templateDescription.trim()) {
                    setErrors(prev => ({ ...prev, description: true }));
                  }
                }}
              />
              {errors.description && (
                <p className="text-xs text-destructive">Description is required</p>
              )}
            </div>
          </CardContent>
        </Card>

        {jsonValue && (
          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <CardHeader className="shrink-0 px-4 py-3">
              <CardTitle className="text-base font-medium">JSON</CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col px-4 pb-4">
              <div className="min-h-0 flex-1 overflow-auto rounded-md">
                <CodeSnippet value={jsonValue} lineNumbers={false} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column: Preview */}
      <div className="flex-1">
        <Card className="flex h-full max-h-[80vh] flex-col">
          <CardHeader className="px-4 py-3">
            <CardTitle className="text-base font-medium">Preview</CardTitle>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 overflow-auto px-3 pb-3">
            {compiledHtml
              ? (
                  <iframe
                    title="Preview"
                    srcDoc={compiledHtml}
                    sandbox=""
                    className="size-full"
                  >
                  </iframe>
                )
              : (
                  <div className="text-sm text-gray-500">Generating preview...</div>
                )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
