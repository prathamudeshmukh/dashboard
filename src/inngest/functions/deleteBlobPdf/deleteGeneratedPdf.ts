import { del, list } from '@vercel/blob';

import { isFileExpired } from './isFileExpired';

const GENERATED_PDF_EXPIRY_HOURS = 1;

export async function deleteGeneratedPdf(logger: any) {
  try {
    let removedCount = 0;
    const removedFiles: string[] = [];

    const { blobs } = await list({ prefix: 'generated-pdf/' });

    for (const blob of blobs) {
      const { uploadedAt, url } = blob;

      try {
        if (isFileExpired(uploadedAt, GENERATED_PDF_EXPIRY_HOURS)) {
          await del(url);
          removedFiles.push(url);
          removedCount++;
        }
      } catch (error) {
        logger.error(`Failed to delete blob: ${url}`, error);
      }
    }

    return { removedCount, removedFiles };
  } catch (error) {
    logger.error(`Failed to delete generated PDFs: ${error}`);
    throw error;
  }
}
