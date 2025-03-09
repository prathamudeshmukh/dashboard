'use client';

import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

export const h1 = ({ children }: { children?: React.ReactNode }) => (
  <h1 className="mb-8 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-4xl font-bold text-transparent">
    {children}
  </h1>
);

export const h2 = ({ children, id }: { children?: React.ReactNode; id?: string }) => (
  <h2 id={id} className="group mb-4 mt-12 flex scroll-mt-20 items-center text-2xl font-semibold">
    <span>{children}</span>
    <a href={`#${id}`} className="ml-2 opacity-0 transition-opacity group-hover:opacity-100">
      <span className="text-primary">#</span>
    </a>
  </h2>
);

export const h3 = ({ children, id }: { children?: React.ReactNode; id?: string }) => (
  <h3 id={id} className="group mb-3 mt-8 flex scroll-mt-20 items-center text-xl font-semibold">
    <span>{children}</span>
    <a href={`#${id}`} className="ml-2 opacity-0 transition-opacity group-hover:opacity-100">
      <span className="text-primary">#</span>
    </a>
  </h3>
);

export const p = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <p className={cn('text-muted-foreground mb-4 leading-relaxed', className)}>
    {children}
  </p>
);

export const code = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <div className="group relative">
    <pre className={cn('bg-muted p-4 rounded-lg overflow-x-auto mb-6 text-sm border', className)}>
      <code className="font-mono">{children}</code>
    </pre>
    <button
      className="absolute right-2 top-2 rounded bg-primary/10 p-1 text-primary opacity-0 transition-opacity hover:bg-primary/20 group-hover:opacity-100"
      onClick={() => {
        if (typeof children === 'string') {
          navigator.clipboard.writeText(children);
        }
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    </button>
  </div>
);

export const ul = ({ children }: { children?: React.ReactNode }) => (
  <ul className="mb-6 list-none space-y-2 pl-0">{children}</ul>
);

export const li = ({ children }: { children?: React.ReactNode }) => (
  <li className="flex items-start">
    <span className="mr-2 mt-1 text-primary">
      <Check className="size-4" />
    </span>
    <span>{children}</span>
  </li>
);

export const a = ({ href, children }: { href?: string; children?: React.ReactNode }) => (
  <a href={href} className="font-medium text-primary hover:underline">
    {children}
  </a>
);
