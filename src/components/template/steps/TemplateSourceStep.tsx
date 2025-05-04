'use client';

import type { TemplateSourceStepProps } from '@/types/Wizard';

import { CreationMethodEnum } from '../CreateTemplateWizard';
import PDFExtractor from '../PDFExtractor';
import TemplateGallery from '../TemplateGallery';

export default function TemplateSourceStep({
  creationMethod,
}: TemplateSourceStepProps) {
  return (
    <div>
      {creationMethod === CreationMethodEnum.EXTRACT_FROM_PDF
        ? (
            <PDFExtractor />
          )
        : (
            <TemplateGallery />
          )}
    </div>
  );
}
