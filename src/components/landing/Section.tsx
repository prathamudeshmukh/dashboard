import type { LucideIcon } from 'lucide-react';

import { cn } from '@/utils/Helpers';

export const Section = (props: {
  children: React.ReactNode;
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  description?: string | React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}) => {
  const Icon = props.icon;

  return (
    <div className={cn('px-3 py-16', props.className)}>
      {(props.title || props.subtitle || props.description) && (
        <div className="mx-auto mb-12 max-w-screen-md text-center">
          {props.subtitle && (
            <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-sm font-bold text-transparent">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                {Icon && <Icon className="mr-2 size-4 text-primary" />}
                {props.subtitle}
              </div>
            </div>
          )}

          {props.title && (
            <div className="mt-1 text-6xl font-semibold">{props.title}</div>
          )}

          {props.description && (
            <div className="mt-2 text-2xl text-muted-foreground">
              {props.description}
            </div>
          )}
        </div>
      )}

      <div className="mx-auto max-w-screen-lg">{props.children}</div>
    </div>
  );
};
