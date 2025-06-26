'use client';

import { Lightbulb } from 'lucide-react';

import HandlebarsEditor from '@/components/template/HandlebarsEditor';

export default function HandlebarsEditorFrame() {
  return (
    <>
      <div className="border-b bg-amber-50/50 p-4">
        <InfoMessage text="You're using the Code Editor. Use Handlebars syntax for full control. Prefer a visual approach? Try the Visual Editor." />
      </div>
      <div className="flex-1 overflow-auto p-4">
        <HandlebarsEditor />
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
