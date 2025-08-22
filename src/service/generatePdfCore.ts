import contentGenerator from '@/service/contentGenerator';
import { generatePDFBuffer } from '@/service/generatePDFBuffer';
import type { GeneratePdfCoreRequest, GeneratePdfCoreResult } from '@/types/PDF/GeneratePDF';

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
