'use client';

import { ArrowRight, FileUp, Key, Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';

type FtuxWelcomeProps = {
  onStart: () => void;
};

const STEPS = [
  { label: 'Pick a method', icon: FileUp },
  { label: 'Customize', icon: Pencil },
  { label: 'Get your API key', icon: Key },
] as const;

// TODO: Replace with real docs URL when available
const EXAMPLES_URL = 'https://docs.templify.dev/examples';

export function FtuxWelcome({ onStart }: FtuxWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-8 text-center">
      <div>
        <h2 className="text-4xl font-bold">Turn a PDF into a live API endpoint.</h2>
        <p className="mt-2 text-sm text-muted-foreground">takes ~2 min</p>
      </div>

      <div className="flex items-center gap-3">
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
        <Button onClick={onStart} className="rounded-full bg-primary text-base">
          Create your first template
        </Button>
        <Button variant="outline" className="rounded-full text-base" asChild>
          <a href={EXAMPLES_URL} target="_blank" rel="noreferrer">
            See live examples
          </a>
        </Button>
      </div>
    </div>
  );
}
