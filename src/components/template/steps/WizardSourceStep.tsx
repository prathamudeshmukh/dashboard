'use client';

import PDFExtractor from '../PDFExtractor';

type WizardSourceStepProps = {
  creationMethod?: 'pdf' | 'gallery';
  extractedHtml?: string | null;
  setExtractedHtml?: (html: string) => void;
};

export default function WizardSourceStep({
  creationMethod,
}: WizardSourceStepProps) {
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
