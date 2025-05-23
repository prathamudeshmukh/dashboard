'use client';

import { Lightbulb } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useTemplateStore } from '@/libs/store/TemplateStore';

import EditorSwitchHeader from '../EditorSwitchHeader';
import HandlebarsEditor from '../HandlebarsEditor';
import HTMLBuilder from '../HTMLBuilder';

export enum EditorTypeEnum {
  VISUAL = 'visual',
  HANDLEBARS = 'handlebar',
}

export default function TemplateEditorStep() {
  const { activeTab, setActiveTab } = useTemplateStore();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Card className="w-full border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-2xl font-semibold">Edit Template</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <EditorSwitchHeader activeTab={activeTab} onTabChange={handleTabChange} />

          <TabsContent value={EditorTypeEnum.VISUAL} className="mt-0 border-0 p-0">
            <div className="border-b bg-amber-50/50 p-4">
              <InfoMessage text="Drag and drop elements to build your template visually. Changes here will not affect your Handlebars template." />
            </div>
            <div className="p-4">
              <div className="min-h-[700px]">
                <HTMLBuilder />
              </div>
            </div>
          </TabsContent>

          <TabsContent value={EditorTypeEnum.HANDLEBARS} className="mt-0 border-0 p-0">
            <div className="border-b bg-amber-50/50 p-4">
              <InfoMessage text="You're using the Code Editor, which give you full control over your template using Handlebars syntax. Need a simpler approach? Switch to the Visual Editor to build your template using drag-and-drop" />
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
      <Lightbulb className="text-orange-300" />
      <p className="text-base font-normal text-muted-foreground">{text}</p>
    </div>
  );
}
