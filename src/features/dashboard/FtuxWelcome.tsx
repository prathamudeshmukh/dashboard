'use client';

import { ArrowRight, FileUp, Key, Pencil, Plus, Zap } from 'lucide-react';
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
    <div className="relative flex min-h-[420px] flex-col items-center justify-center gap-7 overflow-hidden rounded-xl py-8 text-center" style={{ background: '#f8f5ff' }}>
      {/* decorative blobs */}
      <div className="pointer-events-none absolute right-0 top-0 size-56 -translate-y-1/3 translate-x-1/3 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #c7d2fe, transparent)' }} />
      <div className="pointer-events-none absolute bottom-0 left-0 size-64 -translate-x-1/3 translate-y-1/3 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #ddd6fe, transparent)' }} />

      <div className="relative z-10 max-w-sm">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-white/60 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm">
          <Zap className="size-3" />
          Takes ~2 min
        </div>
        <h1 className="text-2xl font-bold leading-snug">Create a template. Get an API that generates PDFs.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Design your document layout once — invoices, contracts, reports — and Templify
          gives you an API endpoint. Send it data, get back a perfect PDF every time.
        </p>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-center gap-2">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex items-center gap-2">
              <span className="flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm">
                <Icon className="size-3.5 text-primary" />
                {step.label}
              </span>
              {index < STEPS.length - 1 && (
                <ArrowRight className="size-3.5 shrink-0 text-primary/40" />
              )}
            </div>
          );
        })}
      </div>

      <div className="relative z-10 flex gap-3">
        <Button
          onClick={onStart}
          className="h-auto rounded-full px-5 py-2.5 text-sm shadow-lg shadow-primary/20"
        >
          <Plus className="size-4" />
          Create your first template
        </Button>
        <Button
          variant="outline"
          className="h-auto rounded-full border-primary/20 bg-white/70 px-5 py-2.5 text-sm backdrop-blur-sm"
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
