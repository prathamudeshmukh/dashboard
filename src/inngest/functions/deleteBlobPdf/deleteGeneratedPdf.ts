import { del, list } from '@vercel/blob';

import { isFileExpired } from './isFileExpired';

const GENERATED_PDF_EXPIRY_HOURS = 1;

export async function deleteGeneratedPdf(logger: any) {
  try {
    let removedCount = 0;
    const removedFiles: string[] = [];

    const { blobs } = await list({ prefix: 'generated-pdf/' });

    for (const file of blobs) {
      const { uploadedAt, url } = file;

      if (isFileExpired(uploadedAt, GENERATED_PDF_EXPIRY_HOURS)) {
        await del(url);
        removedFiles.push(url);
        removedCount++;
      }
    }

    return { removedCount, removedFiles };
  } catch (error) {
    logger.error(`Failed to delete pdf: ${error}`);
    throw error;
  }
}
