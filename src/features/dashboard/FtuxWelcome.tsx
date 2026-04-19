'use client';

import { ArrowRight, FileUp, Key, Pencil, Plus } from 'lucide-react';
import { EXAMPLES_URL } from 'templify.constants';

import { Button } from '@/components/ui/button';
import { trackEvent } from '@/libs/analytics/trackEvent';

type FtuxWelcomeProps = {
  onStart: () => void;
  userId: string;
};

const STEPS = [
  { label: 'Pick a method', icon: FileUp },
  { label: 'Customize', icon: Pencil },
  { label: 'Get your API key', icon: Key },
] as const;

export function FtuxWelcome({ onStart, userId }: FtuxWelcomeProps) {
  const handleExamplesClick = () => {
    trackEvent('ftux_examples_cta_clicked', { user_id: userId });
  };

  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-8 py-8 text-center">
      <div className="max-w-lg">
        <h1 className="text-4xl font-bold">Turn a PDF into a live API endpoint.</h1>
        <p className="mt-2 text-sm text-muted-foreground">takes ~2 min</p>
        <p className="mt-4 text-muted-foreground">
          A template is your document blueprint — define the layout once, then generate
          PDFs on demand by calling your API with any data. Invoices, contracts, reports:
          one API call, one PDF, every time.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex items-center gap-3">
              <span className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium">
                <Icon className="size-4 text-primary" />
                {step.label}
              </span>
              {index < STEPS.length - 1 && (
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button onClick={onStart} className="h-auto rounded-full bg-primary px-6 py-3 text-lg">
          <Plus className="size-5" />
          Create your first template
        </Button>
        <Button
          variant="outline"
          className="h-auto rounded-full px-6 py-3 text-lg"
          onClick={handleExamplesClick}
          asChild
        >
          <a href={EXAMPLES_URL} target="_blank" rel="noreferrer">
            See live examples
          </a>
        </Button>
      </div>
    </div>
  );
}
