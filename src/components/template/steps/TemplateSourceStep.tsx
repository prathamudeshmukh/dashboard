'use client';

import type { TemplateSourceStepProps } from '@/types/Wizard';

import PDFExtractor from '../PDFExtractor';

export default function TemplateSourceStep({
  creationMethod,
}: TemplateSourceStepProps) {
  return (
    <div>
      {creationMethod === 'pdf'
        ? (
            <div>
              <PDFExtractor />
            </div>
          )
        : (
            <div>template</div>
          )}
    </div>
  );
}
