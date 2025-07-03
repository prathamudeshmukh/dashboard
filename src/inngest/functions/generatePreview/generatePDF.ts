import { generatePdf } from '@/libs/actions/templates';

export async function generatePDF(templateId: string, logger: any): Promise<ArrayBuffer> {
  logger.info('Generating PDF for template', { templateId });

  try {
    const result = await generatePdf({ templateId });

    if (result.error) {
      throw new Error(`PDF generation failed: ${result.error}`);
    }

    if (!result.pdf) {
      throw new Error('PDF generation returned empty result');
    }

    return result.pdf;
  } catch (error) {
    logger.error('PDF generation error', { templateId, error });
    throw error;
  }
}
