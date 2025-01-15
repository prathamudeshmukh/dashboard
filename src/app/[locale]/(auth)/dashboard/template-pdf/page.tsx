'use client';
import { useAuth } from '@clerk/nextjs';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Page = () => {
  const { getToken } = useAuth(); // Get the session token
  const [templateId, setTemplateId] = useState<string>('');
  const [templateData, setTemplateData] = useState<string>('');
  const [base64String, setBase64String] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTemplateToPdfConvert = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get the Clerk token
      const token = await getToken();
      if (!token) {
        throw new Error('Authorization token is missing.');
      }

      const parsedData = templateData ? JSON.parse(templateData) : {};

      const payload = JSON.stringify({ templateId, templateData: parsedData });

      // Call the API
      const response = await fetch('/api/template-to-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the token
        },
        body: payload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      const data = await response.json();
      setBase64String(data.pdfBase64); // Set the Base64 string
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Input
        type="text"
        placeholder="Enter Template ID"
        value={templateId}
        onChange={e => setTemplateId(e.target.value)}
      />
      <Input
        type="text"
        placeholder="Enter Template Data"
        value={templateData}
        onChange={e => setTemplateData(e.target.value)}
      />
      <Button
        className="mt-4"
        onClick={handleTemplateToPdfConvert}
        disabled={loading}
      >
        {loading ? 'Converting...' : 'Convert'}
      </Button>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      <span className="mt-4 block break-words text-gray-800">
        <strong>Base64 String:</strong>
        {' '}
        {base64String}
      </span>
    </div>
  );
};

export default Page;
