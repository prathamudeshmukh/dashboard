import { put } from '@vercel/blob';

import { fetchTemplateById } from '@/libs/actions/templates';
import type { JsonValue } from '@/types/Template';

import { generatePdfWorker } from './generatePdfWorker';

export async function GenerateAnduploadPDF(templateId: string, logger: any) {
  logger.info('Generating and Uploading PDF for template', { templateId });

  try {
    const templateResult = await fetchTemplateById(templateId);

    if (templateResult.error) {
      throw new Error(`Template fetch failed: ${templateResult.error.message}`);
    }

    const template = templateResult.data;

    // Generate PDF using worker-compatible function
    const result = await generatePdfWorker({
      templateContent: template.templateContent as string,
      templateStyle: template.templateStyle || '',
      templateData: template.templateSampleData as JsonValue,
    });

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
    throw new Error(`Blob upload failed: ${error}`);
  }
}
