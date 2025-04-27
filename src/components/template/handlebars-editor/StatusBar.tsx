'use client';

import { CheckCircle2 } from 'lucide-react';

type StatusBarProps = {
  lastSaved: string | null;
};

export function StatusBar({ lastSaved }: StatusBarProps) {
  return (
    <div className="flex items-center justify-between border-t border-gray-700 bg-[#007acc] px-4 py-1 text-xs text-white">
      <div className="flex items-center">
        <span className="mr-4">Ln 1, Col 1</span>
        <span className="mr-4">Spaces: 2</span>
        <span className="mr-4">UTF-8</span>
        <span>Handlebars</span>
      </div>
      <div className="flex items-center">
        {lastSaved && (
          <div className="mr-4 flex items-center">
            <CheckCircle2 className="mr-1 size-3" />
            <span>
              Saved at
              {lastSaved}
            </span>
          </div>
        )}
        <span>Ready</span>
      </div>
    </div>
  );
}
