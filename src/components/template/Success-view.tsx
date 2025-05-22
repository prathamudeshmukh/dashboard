'use client';

import { useUser } from '@clerk/nextjs';
import { Check, ChevronRight, Copy, FileText } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getClientSecret } from '@/libs/actions/user';
import type { SuccessViewProps } from '@/types/Template';

import { IntegrationCodeViewer } from './handlebars-editor/IntegrationCodeViewer';

export default function SuccessView({ templateId, templateName, templateSampleData, onViewDashboard, onCreateAnother }: SuccessViewProps) {
  const [activeTab, setActiveTab] = useState('javascript');
  const { user } = useUser();
  const [secret, setSecret] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);

  const handleSecret = async () => {
    if (!user) {
      return;
    }
    try {
      const result = await getClientSecret(user.id);

      if (!result) {
        return;
      }

      setSecret(result.clientSecret);
    } catch (error) {
      console.error(`Failed to retrieve client Secret, ${error}`);
    }
  };

  useEffect(() => {
    handleSecret();
  }, [user]);

  // Parse the template sample data if available
  const parsedSampleData = templateSampleData
    ? (() => {
        try {
          return JSON.parse(templateSampleData as string);
        } catch (e) {
          console.error(e);
          return {};
        }
      })()
    : {};

  const handleCopy = (code: string, language: string) => {
    navigator.clipboard.writeText(code);
    setCopied(language);
    setTimeout(() => setCopied(null), 2000);
  };

  // Generate a formatted version of the sample data for code snippets
  const formattedSampleData = Object.keys(parsedSampleData).length > 0
    ? JSON.stringify(parsedSampleData, null, 2)
    : `{}`;

  // Code snippets for different languages
  const codeSnippets = {
    javascript: `// Using fetch API
const response = await fetch('https://api.templify.com/convert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': '${secret}'
  },
  body: JSON.stringify({
    templateId: '${templateId}',
    data: ${formattedSampleData},
    options: {
      format: 'pdf'
    }
  })
});

const pdf = await response.blob();`,

    python: `import requests
import json

response = requests.post(
    'https://api.templify.com/convert',
    headers={
        'Content-Type': 'application/json',
        'Authorization': '${secret}'
    },
    json={
        'templateId': '${templateId}',
        'data': ${formattedSampleData.replace(/'/g, '"')},
        'options': {
            'format': 'pdf'
        }
    }
)

# Save the PDF
with open('output.pdf', 'wb') as f:
    f.write(response.content)`,

    php: `<?php
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, 'https://api.templify.com/convert');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);

$data = [
    'templateId' => '${templateId}',
    'data' => '${formattedSampleData.replace(/'/g, '"')}',
    'options' => [
        'format' => 'pdf'
    ]
];

curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization': '${secret}'
]);

$response = curl_exec($ch);
curl_close($ch);

// Save the PDF
file_put_contents('output.pdf', $response);`,

    shell: `curl -X POST https://api.templify.com/convert \\
  -H "Content-Type: application/json" \\
  -H "Authorization: ${secret}" \\
  -d '{
    "templateId": "${templateId}",
    "data": ${formattedSampleData.replace(/'/g, '"')},
    "options": {
      "format": "pdf"
    }
  }' \\
  --output output.pdf`,
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-100 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-green-100 p-3">
              <Check className="size-8 text-green-600" />
            </div>
            <h2 className="mb-2 text-4xl font-bold text-green-800">Template Created Successfully!</h2>
            <p className="max-w-md text-base text-green-700">
              Your template "
              {templateName}
              " has been created and is ready to use.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Template ID</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between rounded-md bg-muted p-3">
            <code className="font-mono text-base">{templateId}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(templateId);
                setCopied('id');
                setTimeout(() => setCopied(null), 2000);
              }}
            >
              {copied === 'id'
                ? (
                    <>
                      <Check className="mr-1 size-4" />
                      Copied
                    </>
                  )
                : (
                    <>
                      <Copy className="mr-1 size-4" />
                      Copy
                    </>
                  )}
            </Button>
          </div>
          <p className="mb-4 text-base text-muted-foreground">
            Use this Template ID to reference your template when making API calls.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Code</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-base text-muted-foreground">
            Use the following code to render your template with the Templify API:
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 py-6">
              <TabsTrigger className="text-lg" value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger className="text-lg" value="python">Python</TabsTrigger>
              <TabsTrigger className="text-lg" value="php">PHP</TabsTrigger>
              <TabsTrigger className="text-lg" value="shell">cURL</TabsTrigger>
            </TabsList>

            {Object.entries(codeSnippets).map(([language, code]) => (
              <TabsContent key={language} value={language}>
                <div className="relative">
                  <IntegrationCodeViewer readOnly={true} value={code} isReady={true} language={language} onChange={() => code} />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute right-2 top-2 z-10"
                    onClick={() => handleCopy(code, language)}
                  >
                    {copied === language
                      ? (
                          <>
                            <Check className="mr-1 size-4" />
                            Copied
                          </>
                        )
                      : (
                          <>
                            <Copy className="mr-1 size-4" />
                            Copy
                          </>
                        )}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-6 flex items-end justify-end">
            <Link href="/docs">
              <Button variant="outline" className="rounded-full text-lg font-medium">
                <FileText className="mr-2 size-4" />
                View API Documentation
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button variant="outline" onClick={onCreateAnother} className="flex-1 rounded-full text-lg font-medium">
          Create Another Template
        </Button>
        <Button onClick={onViewDashboard} className="flex-1 rounded-full text-lg font-medium">
          Go to Dashboard
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}
