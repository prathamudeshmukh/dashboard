'use client';

import type { WizardSourceStepProps } from '@/types/Wizard';

import PDFExtractor from '../PDFExtractor';

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
