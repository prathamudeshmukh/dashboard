'use client';

import { useState } from 'react';

import { useTemplateStore } from '@/libs/store/TemplateStore';
import { CreationMethodEnum } from '@/types/Enum';

import PDFExtractor from '../PDFExtractor';
import TemplateGallery from '../TemplateGallery';

type TemplateSourceStepProps = {
  onUseAsIs: () => void;
  onCustomize: () => void;
};

export default function TemplateSourceStep({ onUseAsIs, onCustomize }: TemplateSourceStepProps) {
  const [showPdfUpload, setShowPdfUpload] = useState(false);
  const { setCreationMethod } = useTemplateStore();

  const switchToPdf = () => {
    setCreationMethod(CreationMethodEnum.EXTRACT_FROM_PDF);
    setShowPdfUpload(true);
  };

  const switchToGallery = () => {
    setCreationMethod(CreationMethodEnum.TEMPLATE_GALLERY);
    setShowPdfUpload(false);
  };

  if (showPdfUpload) {
    return (
      <div className="space-y-4">
        <PDFExtractor />
        <button
          type="button"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          onClick={switchToGallery}
        >
          ← Back to gallery
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TemplateGallery onUseAsIs={onUseAsIs} onCustomize={onCustomize} />
      <button
        type="button"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        onClick={switchToPdf}
      >
        Upload PDF instead
      </button>
    </div>
  );
}
