import type { GeneratePdfCoreRequest, GeneratePdfCoreResult } from '../types/PDF/GeneratePDF';
import contentGenerator from './contentGenerator';
import { generatePDFBuffer } from './generatePDFBuffer';

export async function generatePdfCore({
  templateContent,
  templateStyle,
  templateData,
}: GeneratePdfCoreRequest): Promise<GeneratePdfCoreResult> {
  const content = await contentGenerator({
    templateContent,
    templateStyle,
    templateData,
  });

  const pdfBuffer = await generatePDFBuffer(content);

  return { pdf: pdfBuffer };
}
