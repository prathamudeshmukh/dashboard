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

  return (
    <div className="flex h-[80vh] flex-col gap-6 lg:flex-row">
      {/* Left Column: Details + JSON */}
      <div className="flex-1 space-y-6 pr-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-medium">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              <span className="font-semibold">Type:</span>
              {' '}
              {creationMethod}
            </p>

            <div className="grid gap-1">
              <Label className="text-base font-normal">Name</Label>
              <Input
                data-testid="review-template-name"
                className="text-base font-normal"
                value={templateName}
                onChange={e => handleNameChange(e.target.value)}
                onBlur={() => {
                  if (!templateName.trim()) {
                    setErrors(prev => ({ ...prev, name: true }));
                  }
                }}
              />
              {errors.name && (
                <p className="text-sm text-destructive">Name is required</p>
              )}
            </div>

            <div className="grid gap-1">
              <Label className="text-base font-normal">Description</Label>
              <TextArea
                data-testid="review-template-description"
                className="text-base font-normal"
                value={templateDescription}
                onChange={e => handleDescriptionChange(e.target.value)}
                onBlur={() => {
                  if (!templateDescription.trim()) {
                    setErrors(prev => ({ ...prev, description: true }));
                  }
                }}
              />
              {errors.description && (
                <p className="text-sm text-destructive">Description is required</p>
              )}
            </div>
          </CardContent>
        </Card>

        {(handlebarTemplateJson && handlebarsCode && activeTab === EditorTypeEnum.HANDLEBARS) && (
          <Card className="max-h-[50vh] overflow-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-medium">JSON</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeSnippet value={handlebarTemplateJson} lineNumbers={false} className="max-w-[480px]" />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column: Preview */}
      <div className="flex-1 pr-2">
        <Card className="flex h-full max-h-[80vh] flex-col">
          <CardHeader>
            <CardTitle className="text-2xl font-medium">Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto px-2">
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
