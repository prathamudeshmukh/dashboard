'use client';

import Handlebars from 'handlebars';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { TextArea } from '@/components/ui/text-area';

const HandlebarsPlayground = () => {
  const [template, setTemplate] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleRender = () => {
    setError(null);

    try {
      // Compile the Handlebars template
      const compiledTemplate = Handlebars.compile(template);

      // Example context data
      const context = {
        name: 'Jane Doe',
        age: 28,
        occupation: 'Designer',
      };

      // Render the template with the context
      const result = compiledTemplate(context);
      setOutput(result);
    } catch (err: any) {
      setError(`Failed to render template: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Handlebars Playground</h1>
      <TextArea
        placeholder="Enter Handlebars template here..."
        value={template}
        onChange={e => setTemplate(e.target.value)}
        rows={6}
        className="w-full"
      />
      <Button onClick={handleRender} className="mt-4">
        Render Template
      </Button>
      {error && <p className="mt-2 text-red-500">{error}</p>}
      <div className="mt-6 rounded-md border bg-gray-50 p-4">
        <h2 className="text-lg font-semibold">Rendered Output:</h2>
        <div
          className="mt-2 text-gray-800"
          dangerouslySetInnerHTML={{ __html: output }}
        />
      </div>
    </div>
  );
};

export default HandlebarsPlayground;
