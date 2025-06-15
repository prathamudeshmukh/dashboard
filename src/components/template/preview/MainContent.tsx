'use client';

import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import type { Template } from '@/types/Template';

type MainContentProps = {
  previewTemplate: Template;
  onRefresh: () => void;
};
export default function MainContent({ previewTemplate, onRefresh }: MainContentProps) {
  return (
    <div className="lg:col-span-2">
      <CardContent className="p-0">
        <div className="flex min-h-[800px] flex-row items-center justify-center border-t p-6">
          {previewTemplate?.previewURL
            ? (
                <iframe
                  key={`${previewTemplate.previewURL}-${previewTemplate.updatedAt}`}
                  src={previewTemplate.previewURL}
                  className="h-[1070px] w-full border-0"
                  title={`${previewTemplate.templateName} Preview`}
                />
              )
            : (
                <div className="space-y-4 text-center">
                  <p className="text-lg text-muted-foreground">Preview is being generated...</p>
                  <Button
                    onClick={onRefresh}
                    className="rounded-full"
                  >
                    Refresh Page
                  </Button>
                </div>
              )}
        </div>
      </CardContent>
    </div>
  );
}
