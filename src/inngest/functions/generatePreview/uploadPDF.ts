import { put } from '@vercel/blob';

export async function uploadPDF(pdfBuffer: ArrayBuffer, templateId: string, logger: any) {
  logger.info('Uploading PDF to Vercel Blob', { templateId });

  try {
    const filename = `${templateId}.pdf`;

    const blob = await put(filename, pdfBuffer, {
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
