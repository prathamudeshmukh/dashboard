'use client';

import { useUser } from '@clerk/nextjs';
import Handlebars from 'handlebars';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/text-area';
import { fetchTemplateById, UpsertTemplate } from '@/libs/actions/templates';
import { type JsonValue, TemplateType } from '@/types/Template';

const HandlebarEditor = () => {
  const { user } = useUser();
  const t = useTranslations('handlebarEditor');
  const [templateContent, setTemplateContent] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [templateName, setTemplateName] = useState<string>('');
  const [inputData, setInputData] = useState<string>(''); // to render on the input we need this state

  const [output, setOutput] = useState<string>(''); // Rendered HTML
  const [error, setError] = useState<string | null>(null); // Error messages

  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId'); // Get templateId from query params

  const handleRender = () => {
    setError(null);

    try {
      // Compile the Handlebars template
      const compiledTemplate = Handlebars.compile(templateContent);

      // Parse the JSON input
      const context = inputData ? JSON.parse(inputData) : {}; // Here again I have to parse the data to pass to the template

      // Render the template with the context
      const result = compiledTemplate(context);
      setOutput(result);
    } catch (err: any) {
      setError(`Failed to render template: ${err.message}`);
    }
  };

  // Automatically update the preview when template or JSON changes
  useEffect(() => {
    if (templateContent || inputData) {
      handleRender();
    }
  }, [templateContent, inputData]);

  useEffect(() => {
    const loadTemplateData = async () => {
      if (!templateId) {
        return;
      }

      const response = await fetchTemplateById(templateId);
      if (!response.success) {
        return;
      }
      // Load the template data into the editor
      setTemplateContent(response.data?.templateContent as string);

      const sampleData: JsonValue = response.data?.templateSampleData || {};
      setInputData(JSON.stringify(sampleData, null, 2)); // Stringify with formatting to render on input text area

      setTemplateName(response.data?.templateName as string);
      setDescription(response.data?.description as string);
    };

    loadTemplateData();
  }, [templateId]);

  const handleSave = async () => {
    if (!user) {
      return;
    }
    // Prepare template data
    const templateData = {
      templateId: templateId || undefined, // Insert or update based on templateId
      description,
      email: user?.emailAddresses[0]?.emailAddress, // Replace with dynamic userId
      templateName,
      templateContent,
      templateSampleData: inputData,
      templateType: TemplateType.HANDLBARS_TEMPLATE,
    };

    const response = await UpsertTemplate(templateData);

    if (response.success) {
      router.push('/dashboard'); // Redirect after successful save
    }
  };

  return (
    <div className="flex space-x-4 p-6">

      {/* Input Section */}
      <div className="flex w-1/2 flex-col space-y-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>

        {/* Handlebars Template Input */}
        <div>
          <h2 className="mb-2 text-lg font-semibold">{t('template')}</h2>
          <TextArea
            placeholder="Enter Handlebars template here..."
            value={templateContent}
            onChange={e => setTemplateContent(e.target.value)}
            rows={6}
            className="w-full"
          />
        </div>

        {/* JSON Data Input */}
        <div>
          <h2 className="mb-2 text-lg font-semibold">{t('input_data')}</h2>
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
        <div className="flex flex-row items-end justify-between">
          <Input
            name="templateName"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            placeholder="Enter Template name"
            className="w-1/3 border border-gray-300"
          />

          <Input
            name="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Enter Description"
            className="w-1/3 border border-gray-300"
          />

          <Button onClick={handleSave}>{templateId ? 'Update' : 'Save'}</Button>
        </div>
        <h2 className="mb-2 text-lg font-semibold">{t('preview')}</h2>
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

export default HandlebarEditor;
