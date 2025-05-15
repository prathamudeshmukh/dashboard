'use client';

import { useTemplateStore } from '@/libs/store/TemplateStore';
import { CreationMethodEnum } from '@/types/Enum';

import PDFExtractor from '../PDFExtractor';
import TemplateGallery from '../TemplateGallery';

export default function TemplateSourceStep() {
  const { creationMethod } = useTemplateStore();
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
