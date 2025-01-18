'use client';
import { useAuth } from '@clerk/nextjs';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Page = () => {
  const { getToken } = useAuth(); // Get the session token
  const [templateId, setTemplateId] = useState<string>('');
  const [templateData, setTemplateData] = useState<string>('');
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

      const payload = JSON.stringify({ templateData: parsedData });

      // Call the API
      const response = await fetch(`/api/convert/${templateId}`, {
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

      // Create a Blob from the response
      const blob = await response.blob();

      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'document.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-row">
        <Input
          type="text"
          placeholder="Enter Template ID"
          value={templateId}
          onChange={e => setTemplateId(e.target.value)}
          className="mt-2"
        />
        <Input
          type="text"
          placeholder="Enter Template Data"
          value={templateData}
          onChange={e => setTemplateData(e.target.value)}
          className="ml-2 mt-2"
        />
      </div>

      <Button
        className="mt-4"
        onClick={handleTemplateToPdfConvert}
        disabled={loading}
      >
        {loading ? 'Converting...' : 'Convert'}
      </Button>
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
};

export default Page;
