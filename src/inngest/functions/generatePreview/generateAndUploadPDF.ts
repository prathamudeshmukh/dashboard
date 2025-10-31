import { put } from '@vercel/blob';

import { generatePdf } from '../../../libs/actions/templates';

export async function GenerateAnduploadPDF(templateId: string, logger: any) {
  logger.info('Generating and Uploading PDF for template', { templateId });

  try {
    const result = await generatePdf({ templateId });

    if (result.error) {
      throw new Error(`PDF generation failed: ${result.error}`);
    }

    if (!result.pdf) {
      throw new Error('PDF generation returned empty result');
    }

    const filename = `${templateId}.pdf`;

    const blob = await put(filename, result.pdf, {
      access: 'public',
      contentType: 'application/pdf',
      addRandomSuffix: false,
    });

    logger.info('PDF uploaded successfully', {
      templateId,
      url: blob.url,
    });

    return blob;
  } catch (error) {
    logger.error('Failed to upload PDF to blob', { templateId, error });
    throw new Error(`Blob upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
