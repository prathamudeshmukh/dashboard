'use client';

import Handlebars from 'handlebars';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { TextArea } from '@/components/ui/text-area';
import { fetchTemplateById, saveTemplate, updateTemplate } from '@/libs/actions/templates';
import { TemplateType } from '@/types/Template';

const HandlebarsPlayground = () => {
  const [template, setTemplate] = useState<string>(''); // Handlebars template
  const [inputData, setInputData] = useState<string>(''); // JSON data for the template
  const [output, setOutput] = useState<string>(''); // Rendered HTML
  const [error, setError] = useState<string | null>(null); // Error messages

  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId'); // Get templateId from query params

  const handleRender = () => {
    setError(null);

    try {
      // Compile the Handlebars template
      const compiledTemplate = Handlebars.compile(template);

      // Parse the JSON input
      const context = inputData.trim() ? JSON.parse(inputData) : {};

      // Render the template with the context
      const result = compiledTemplate(context);
      setOutput(result);
    } catch (err: any) {
      setError(`Failed to render template: ${err.message}`);
    }
  };

  // Automatically update the preview when template or JSON changes
  useEffect(() => {
    if (template || inputData) {
      handleRender();
    }
  }, [template, inputData]);

  useEffect(() => {
    const loadTemplateData = async () => {
      if (templateId) {
        const response = await fetchTemplateById(templateId);
        if (!response.success) {
          return;
        }
        // Load the template data into the editor
        setTemplate(response.data?.templateContent as string);
        setInputData(response.data?.templateSampleData as string);
      }
    };
    loadTemplateData();
    handleRender();
  }, [templateId]);

  const handleSave = async () => {
    if (templateId) {
      try {
        const response = await updateTemplate({
          templateId,
          description: 'My Handlbars Template',
          templateContent: template,
          templateStyle: '',
          templateSampleData: JSON.stringify(inputData),
        });

        if (response.success) {
          router.push('/dashboard');
        } else {
          throw new Error(response.error);
        }
      } catch (error: any) {
        console.error('Error saving template:', error);
      }
    } else {
      try {
        // Sample input data for the server action
        const assets = ['https://example.com/asset1.png', 'https://example.com/asset2.png'];

        const response = await saveTemplate({
          description: 'My Handlebars Template',
          userId: 'c9ded72d-4cae-4fab-b86c-a084ec7f2ecc',
          templateContent: template,
          templateSampleData: JSON.stringify(inputData),
          templateStyle: '',
          assets: JSON.stringify(assets),
          templateType: TemplateType.HANDLBARS_TEMPLATE,
        });

        if (response.success) {
          router.push('/dashboard');
        } else {
          throw new Error(response.error);
        }
      } catch (error: any) {
        console.error('Error saving template:', error);
      }
    }
  };

  return (
    <div className="flex space-x-4 p-6">
      {/* Input Section */}
      <div className="flex w-1/2 flex-col space-y-4">
        <h1 className="text-2xl font-bold">Handlebars Playground</h1>

        {/* Handlebars Template Input */}
        <div>
          <h2 className="mb-2 text-lg font-semibold">Template</h2>
          <TextArea
            placeholder="Enter Handlebars template here..."
            value={template}
            onChange={e => setTemplate(e.target.value)}
            rows={6}
            className="w-full"
          />
        </div>

        {/* JSON Data Input */}
        <div>
          <h2 className="mb-2 text-lg font-semibold">Input Data (JSON)</h2>
          <TextArea
            placeholder='Enter JSON data here, e.g., {"name": "John", "age": 30}'
            value={inputData}
            onChange={e => setInputData(e.target.value)}
            rows={6}
            className="w-full"
          />
        </div>

        {error && <p className="mt-2 text-red-500">{error}</p>}
      </div>

      {/* Preview Section */}
      <div className="mt-2 w-2/3">
        <div className="flex flex-row items-end justify-end">
          <Button onClick={handleSave}>{templateId ? 'Update' : 'Save'}</Button>
        </div>
        <h2 className="mb-2 text-lg font-semibold">Preview</h2>
        <div className="rounded-md border bg-gray-50 p-4">
          <div
            className="mt-2 text-gray-800"
            dangerouslySetInnerHTML={{ __html: output }}
          />
        </div>
      </div>
    </div>
  );
};

export default HandlebarsPlayground;
