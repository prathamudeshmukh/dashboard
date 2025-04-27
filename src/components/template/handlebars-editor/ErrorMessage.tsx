'use client';

import { XCircle } from 'lucide-react';

import type { ErrorMessageProps } from './types';

export function ErrorMessage({ error, type = 'template' }: ErrorMessageProps) {
  if (!error) {
    return null;
  }

  return (
    <div className="border-t border-gray-700 bg-[#2d2d2d] p-2 text-xs text-red-400">
      <div className="flex items-center">
        <XCircle className="mr-1 size-3.5 text-red-400" />
        <strong>{type === 'json' ? 'JSON Error:' : 'Error:'}</strong>
        {' '}
        <span className="ml-1">{error}</span>
      </div>
    </div>
  );
}
