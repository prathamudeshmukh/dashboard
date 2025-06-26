'use client';

import { Lightbulb } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';

import { ErrorFallback } from '@/components/template/ErrorFallback';
import HTMLBuilder from '@/components/template/HTMLBuilder';

export default function HTMLBuilderFrame() {
  return (
    <>
      <div className="border-b bg-amber-50/50 p-4">
        <InfoMessage text="Drag and drop elements to build your template visually. This editor doesn’t reflect changes made in the code editor." />
      </div>
      <div className="flex-1 overflow-auto p-4">
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => {
            // Reset any state or trigger reload
          }}
        >
          <HTMLBuilder />
        </ErrorBoundary>
      </div>
    </>
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
