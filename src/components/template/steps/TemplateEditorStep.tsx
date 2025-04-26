'use client';

import { Code, ExternalLink, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import HTMLBuilder from '../HTMLBuilder';

type TemplateEditorStepProps = {
  extractedTemplateId?: string;
};

export default function TemplateEditorStep({
  extractedTemplateId,
}: TemplateEditorStepProps) {
  const [editorActiveTab, setEditorActiveTab] = useState('handlebars');

  return (
    <Card className="w-full border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">Edit Template</CardTitle>
          <p className="mt-1 text-muted-foreground">
            Customize your template using our editor
          </p>
        </div>
        {extractedTemplateId && (
          <Link href={`/editor/${extractedTemplateId}`} target="_blank" passHref>
            <Button variant="outline" size="sm" className="gap-1">
              <ExternalLink className="mr-1 size-4" />
              Open in Full Editor
            </Button>
          </Link>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={editorActiveTab} onValueChange={setEditorActiveTab} className="w-full">
          <div className="border-b px-4">
            <TabsList className="h-14 bg-transparent">
              <TabsTrigger value="handlebars" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-muted/50">
                <Code className="mr-2 size-4" />
                Visual Editor
              </TabsTrigger>
              <TabsTrigger value="visual" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-muted/50">
                <FileText className="mr-2 size-4" />
                Handlebars Editor
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="handlebars" className="mt-0 border-0 p-0">
            <div className="border-b bg-muted/20 p-4">
              <InfoMessage text="Create dynamic templates using Handlebars syntax. Use {{variable}} to insert dynamic content." />
            </div>
            <div className="p-4">
              <div className="min-h-[700px]">
                <HTMLBuilder />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visual" className="mt-0 border-0 p-0">
            <div className="border-b bg-muted/20 p-4">
              <InfoMessage text="Drag and drop elements to build your template visually. Changes here will not affect your Handlebars template." />
            </div>
            <div className="p-4">
              <div className="min-h-[700px]">
                <div>Handlebar Editor</div>
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  );
}

function InfoMessage({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 text-muted-foreground"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
