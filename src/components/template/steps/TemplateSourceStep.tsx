'use client';

import { CreationMethodEnum } from '@/types/Enum';
import type { TemplateSourceStepProps } from '@/types/Wizard';

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
