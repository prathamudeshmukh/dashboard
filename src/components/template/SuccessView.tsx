'use client';

import { useUser } from '@clerk/nextjs';
import { Check, ChevronRight, Copy, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { BASE_API_URL } from 'templify.constants';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getClientSecret } from '@/libs/actions/user';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import { generateCodeSnippets } from '@/service/generateCodeSnippets';

import { CodeSnippet } from '../CodeSnippet';

export default function SuccessView() {
  const [activeTab, setActiveTab] = useState('javascript');
  const { user } = useUser();
  const [secret, setSecret] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);
  const { successData } = useTemplateStore();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
    if (!successData) {
      router.push('/dashboard');
      return;
    }
    setIsLoading(false);
  }, [successData]);

  const handleViewDashboard = () => {
    router.push('/dashboard');
  };

  const handleCreateAnother = () => {
    router.push('/dashboard/create-template');
  };

  // Generate a formatted version of the sample data for code snippets
  const formattedSampleData = successData?.templateSampleData
    ? JSON.stringify(successData.templateSampleData, null, 2)
    : `{}`;

  // Code snippets for different languages
  const codeSnippets = useMemo(() => {
    return generateCodeSnippets({
      BASE_API_URL,
      templateId: successData?.templateId as string,
      secret,
      userId: user?.id as string,
      formattedSampleData,
    });
  }, [BASE_API_URL, successData, secret, user, formattedSampleData]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card data-testid="success-card" className="border-green-100 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-green-100 p-3">
              <Check className="size-8 text-green-600" />
            </div>
            <h2 data-testid="success-title" className="mb-2 text-4xl font-bold text-green-800">Template Created Successfully!</h2>
            <p data-testid="success-message" className="max-w-md text-base text-green-700">
              Your template "
              {successData?.templateName}
              " has been created and is ready to use.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="template-id-card">
        <CardHeader>
          <CardTitle>Your Template ID</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between rounded-md bg-muted p-3">
            <code data-testid="template-id" className="font-mono text-base">{successData?.templateId}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(successData?.templateId as string);
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
                <CodeSnippet value={code} language={language} className="max-h-[450px]" />
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
        <Button data-testid="create-another-btn" variant="outline" onClick={handleCreateAnother} className="flex-1 rounded-full text-lg font-medium">
          Create Another Template
        </Button>
        <Button data-testid="dashboard-btn" onClick={handleViewDashboard} className="flex-1 rounded-full text-lg font-medium">
          Go to Dashboard
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}
