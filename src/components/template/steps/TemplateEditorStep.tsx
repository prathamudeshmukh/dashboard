'use client';

import { Code, FileText } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTemplateStore } from '@/libs/store/TemplateStore';

import HandlebarsEditor from '../HandlebarsEditor';
import HTMLBuilder from '../HTMLBuilder';

export enum EditorTypeEnum {
  VISUAL = 'visual',
  HANDLEBARS = 'handlebar',
}

export default function TemplateEditorStep() {
  const { activeTab, setActiveTab } = useTemplateStore();

  return (
    <Card className="w-full border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-2xl font-semibold">Edit Template</CardTitle>
          <p className="mt-1 text-base font-normal text-muted-foreground">
            Customize your template using our editor
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b px-4">
            <TabsList className="h-14 bg-transparent">
              <TabsTrigger value={EditorTypeEnum.VISUAL} className="rounded-none border-b-2 border-transparent text-base data-[state=active]:border-primary data-[state=active]:bg-muted/50">
                <FileText className="mr-2 size-4" />
                Visual Editor
              </TabsTrigger>
              <TabsTrigger value={EditorTypeEnum.HANDLEBARS} className="rounded-none border-b-2 border-transparent text-base data-[state=active]:border-primary data-[state=active]:bg-muted/50">
                <Code className="mr-2 size-4" />
                Handlebars Editor
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={EditorTypeEnum.VISUAL} className="mt-0 border-0 p-0">
            <div className="border-b bg-muted/20 p-4">
              <InfoMessage text="Drag and drop elements to build your template visually. Changes here will not affect your Handlebars template." />
            </div>
            <div className="p-4">
              <div className="min-h-[700px]">
                <HTMLBuilder />
              </div>
            </div>
          </TabsContent>

          <TabsContent value={EditorTypeEnum.HANDLEBARS} className="mt-0 border-0 p-0">
            <div className="border-b bg-muted/20 p-4">
              <InfoMessage text="Create dynamic templates using Handlebars syntax. Use {{variable}} to insert dynamic content." />
            </div>
            <div className="p-4">
              <div className="min-h-[700px]">
                <HandlebarsEditor />
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
      <p className="text-base font-normal text-muted-foreground">{text}</p>
    </div>
  );
}
