'use client';

import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import contentGenerator from '@/service/contentGenerator';
import { TemplateType } from '@/types/Template';

import { EditorTypeEnum } from './TemplateEditorStep';

export default function TemplateReviewStep() {
  const [compiledHtml, setCompiledHtml] = useState<string>('');
  const { creationMethod, templateName, templateDescription, htmlContent, htmlStyle, handlebarsCode, handlebarsJson, activeTab } = useTemplateStore();

  useEffect(() => {
    const generate = async () => {
      try {
        if (handlebarsCode && handlebarsJson && activeTab === EditorTypeEnum.HANDLEBARS) {
          const parsedJson = JSON.parse(handlebarsJson);
          const result = await contentGenerator({
            templateType: TemplateType.HANDLBARS_TEMPLATE,
            templateContent: handlebarsCode,
            templateData: parsedJson,
          });
          setCompiledHtml(result);
        } else if (htmlContent && activeTab === EditorTypeEnum.VISUAL) {
          const result = await contentGenerator({
            templateType: TemplateType.HTML_BUILDER,
            templateContent: htmlContent,
            templateStyle: htmlStyle as string,
          });
          setCompiledHtml(result);
        }
      } catch (err) {
        console.error('Error generating content:', err);
        setCompiledHtml(`<pre style="color: red;">Error: ${(err as Error).message}</pre>`);
      }
    };

    generate();
  }, [handlebarsCode, handlebarsJson, htmlContent, htmlStyle]);

  return (
    <div className="flex h-[80vh] flex-col gap-6 lg:flex-row">
      {/* Left Column: Details + JSON */}
      <div className="flex-1 space-y-6 pr-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-medium">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="font-semibold">Name:</span>
              {' '}
              {templateName}
            </p>
            <p>
              <span className="font-semibold">Type:</span>
              {' '}
              {creationMethod}
            </p>
            <p>
              <span className="font-semibold">Description:</span>
              {' '}
              {templateDescription}
            </p>
          </CardContent>
        </Card>

        {(handlebarsJson && handlebarsCode && activeTab === EditorTypeEnum.HANDLEBARS) && (
          <Card className="max-h-[40vh] overflow-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-medium">Handlebars JSON</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-base font-normal">{handlebarsJson}</pre>
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
