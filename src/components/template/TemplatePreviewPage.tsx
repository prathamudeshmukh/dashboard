'use client';

import { useUser } from '@clerk/nextjs';
import { ArrowLeft, Check, Code, Copy, Edit, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BASE_API_URL } from 'templify.constants';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchTemplateById } from '@/libs/actions/templates';
import { getClientSecret } from '@/libs/actions/user';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import { generateCodeSnippets } from '@/service/generateCodeSnippets';
import type { Template } from '@/types/Template';

import TemplatePreviewLoading from './TemplatePreviewLoading';

export default function TemplatePreviewPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('javascript');
  const [loading, setLoading] = useState<boolean>(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [secret, setSecret] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);
  const { selectedTemplate } = useTemplateStore();

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

  useEffect(() => {
    // Simulate API call to fetch template data
    const fetchTemplate = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        const data = await fetchTemplateById(selectedTemplate as string);
        setPreviewTemplate(data.data as Template);
      } catch (error) {
        console.error('Error fetching template:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [selectedTemplate]);

  const handleCopy = (code: string, language: string) => {
    navigator.clipboard.writeText(code);
    setCopied(language);
    setTimeout(() => setCopied(null), 2000);
  };

  // Generate a formatted version of the sample data for code snippets
  const formattedSampleData = previewTemplate?.templateSampleData
    ? JSON.stringify(previewTemplate.templateSampleData, null, 2)
    : `{}`;

  // Code snippets for different languages
  const codeSnippets = useMemo(() => {
    return generateCodeSnippets({
      BASE_API_URL,
      templateId: previewTemplate?.templateId as string,
      secret,
      userId: user?.id as string,
      formattedSampleData,
    });
  }, [BASE_API_URL, previewTemplate, secret, user, formattedSampleData]);

  if (loading) {
    return (
      <TemplatePreviewLoading />
    );
  }

  return (
    <div className="container max-w-7xl py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-start gap-3">
          <Link href="/dashboard" passHref>
            <Button variant="outline" size="icon" className="mt-1">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{previewTemplate?.templateName}</h1>
              <Badge variant="outline">{previewTemplate?.templateType}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Template ID:
              {previewTemplate?.templateId}
            </p>
            <p className="mt-1 max-w-md text-sm">{previewTemplate?.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/editor/${previewTemplate?.templateId}`}>
            <Button variant="outline" className="w-full rounded-full text-lg">
              <Edit className="mr-2 size-4" />
              Edit Template
            </Button>
          </Link>
          <Link href={`/api-playground?template=${previewTemplate?.templateId}`}>
            <Button className="w-full rounded-full text-lg">
              <Code className="mr-2 size-4" />
              Try in API Playground
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - PDF Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>PDF Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t">
                <iframe
                  src={previewTemplate?.previewURL}
                  className="h-[800px] w-full border-0"
                  title={`${previewTemplate?.templateName} Preview`}
                >
                </iframe>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - API Integration */}
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
                    <code className="rounded bg-muted px-2 py-1 font-mono text-sm">{previewTemplate?.templateId}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(previewTemplate?.templateId as string);
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
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                  <dd className="mt-1">{new Date(previewTemplate?.createdAt as Date).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                  <dd className="mt-1">{new Date(previewTemplate?.updatedAt as Date).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                  <dd className="mt-1">{previewTemplate?.templateType}</dd>
                </div>
              </dl>

              <Separator className="my-4" />

              <div className="mt-4 flex flex-col gap-2">
                <Link href={`/api-playground?template=${previewTemplate?.templateId}`} className="w-full">
                  <Button className="w-full rounded-full text-lg">
                    <Code className="mr-2 size-4" />
                    Try in API Playground
                  </Button>
                </Link>
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
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="php">PHP</TabsTrigger>
                  <TabsTrigger value="shell">cURL</TabsTrigger>
                </TabsList>

                {Object.entries(codeSnippets).map(([language, code]) => (
                  <TabsContent key={language} value={language} className="relative">
                    <div className="relative">
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
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              <div className="mt-4 flex flex-col gap-2">
                <Link href={`/api-playground?template=${previewTemplate?.templateId}`} className="w-full">
                  <Button className="w-full rounded-full text-lg">
                    <Code className="mr-2 size-4" />
                    Try in API Playground
                  </Button>
                </Link>
                <Link href="/docs" className="w-full">
                  <Button variant="outline" className="w-full rounded-full text-lg">
                    <ExternalLink className="mr-2 size-4" />
                    View API Documentation
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
