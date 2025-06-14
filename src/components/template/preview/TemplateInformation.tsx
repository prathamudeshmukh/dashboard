'use client';

import { Check, Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Template } from '@/types/Template';

type Props = {
  previewTemplate: Template;
  codeSnippets: Record<string, string>;
};

export default function TemplateInformation({ previewTemplate, codeSnippets }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('javascript');

  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Template ID</dt>
              <dd className="mt-1 flex items-center justify-between">
                <code className="rounded bg-muted px-2 py-1 font-mono text-sm">{previewTemplate.templateId}</code>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(previewTemplate.templateId as string, 'id')}>
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
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Created</dt>
              <dd className="mt-1">{new Date(previewTemplate.createdAt as Date).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
              <dd className="mt-1">{new Date(previewTemplate.updatedAt as Date).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Type</dt>
              <dd className="mt-1">{previewTemplate.templateType}</dd>
            </div>
          </dl>

          <Separator className="my-4" />

          <div className="mt-4 flex flex-col gap-2">
            <Link href="/docs" className="w-full">
              <Button variant="outline" className="w-full rounded-full text-lg">
                <ExternalLink className="mr-2 size-4" />
                View API Documentation
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Integration</CardTitle>
          <CardDescription>Use this template in your application</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              {Object.keys(codeSnippets).map(lang => (
                <TabsTrigger key={lang} value={lang}>{lang}</TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(codeSnippets).map(([language, code]) => (
              <TabsContent key={language} value={language} className="relative">
                <pre className="max-h-[400px] overflow-x-auto rounded-md bg-muted p-4 text-sm">
                  <code>{code}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2"
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
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
