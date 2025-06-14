'use client';

import { useUser } from '@clerk/nextjs';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { BASE_API_URL } from 'templify.constants';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchTemplateById } from '@/libs/actions/templates';
import { getClientSecret } from '@/libs/actions/user';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import { generateCodeSnippets } from '@/service/generateCodeSnippets';
import { type Template, TemplateType } from '@/types/Template';

import MainContent from './MainContent';
import TemplateInformation from './TemplateInformation';
import TemplatePreviewLoading from './TemplatePreviewLoading';

export default function TemplatePreviewPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [secret, setSecret] = useState<string>('');
  const { selectedTemplate } = useTemplateStore();

  useEffect(() => {
    if (!user) {
      return;
    }
    getClientSecret(user.id)
      .then(res => res?.clientSecret && setSecret(res.clientSecret))
      .catch(err => console.error('Failed to retrieve client Secret', err));
  }, [user]);

  const fetchTemplate = async () => {
    setLoading(true);
    try {
      const data = await fetchTemplateById(selectedTemplate as string);
      setPreviewTemplate(data.data as Template);
    } catch (error) {
      console.error('Error fetching template:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplate();
  }, [selectedTemplate]);

  const formattedSampleData = previewTemplate?.templateSampleData
    ? JSON.stringify(previewTemplate.templateSampleData, null, 2)
    : `{}`;

  const codeSnippets = useMemo(() => {
    return generateCodeSnippets({
      BASE_API_URL,
      templateId: previewTemplate?.templateId as string,
      secret,
      userId: user?.id as string,
      formattedSampleData,
    });
  }, [BASE_API_URL, previewTemplate, secret, user, formattedSampleData]);

  const handleEdit = (templateId: string, templateType: TemplateType) => {
    if (templateType === TemplateType.HTML_BUILDER) {
      router.push(`/dashboard/html-builder?templateId=${templateId}`);
    } else {
      router.push(`/dashboard/handlebar-editor?templateId=${templateId}`);
    }
  };

  if (loading || !previewTemplate) {
    return <TemplatePreviewLoading />;
  }

  return (
    <div className="container max-w-7xl py-6">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-start gap-3">
          <Link href="/dashboard" passHref>
            <Button variant="outline" size="icon" className="mt-1">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{previewTemplate.templateName}</h1>
              <Badge variant="outline">{previewTemplate.templateType}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Template ID:
              {previewTemplate.templateId}
            </p>
            <p className="mt-1 max-w-md text-sm">{previewTemplate.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => handleEdit(previewTemplate.templateId as string, previewTemplate.templateType as TemplateType)} variant="outline" className="w-full rounded-full text-lg">
            <Edit className="mr-2 size-4" />
            Edit Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <MainContent onRefresh={fetchTemplate} previewTemplate={previewTemplate} />
        <TemplateInformation codeSnippets={codeSnippets} previewTemplate={previewTemplate} />
      </div>
    </div>
  );
}
