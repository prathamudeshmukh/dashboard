'use client';

import type { TemplateSourceStepProps } from '@/types/Wizard';

import PDFExtractor from '../PDFExtractor';
import TemplateGallery from '../TemplateGallery';

export default function TemplateSourceStep({
  creationMethod,
}: TemplateSourceStepProps) {
  return (
    <div>
      {creationMethod === 'pdf'
        ? (
            <PDFExtractor />
          )
        : (
            <TemplateGallery />
          )}
    </div>
  );
}
