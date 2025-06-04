import { generatePdf } from '@/libs/actions/templates';

export async function generatePDF(templateId: string, logger: any) {
  logger.info('Generating PDF for template', { templateId });

  const result = await generatePdf({ templateId });

  if (result.error) {
    throw new Error(`PDF generation failed: ${result.error}`);
  }

  if (!result.pdf) {
    throw new Error('PDF generation returned empty result');
  }

  return result.pdf as string;
}
