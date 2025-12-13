import { del, list } from '@vercel/blob';

import { isFileExpired } from './isFileExpired';

const EXTRACTED_PDF_EXPIRY_HOURS = 1;

export async function deleteUploadsPdf(logger: any) {
  try {
    let removedCount = 0;
    const removedFiles: string[] = [];
    let hasMore = true;
    let cursor: string | undefined;

    while (hasMore) {
      const blobsList = await list({ prefix: 'uploads/', cursor });
      const pdfBlobs = blobsList.blobs.filter(blob => blob.pathname.endsWith('.pdf'));

      for (const blob of pdfBlobs) {
        const { uploadedAt, url } = blob;

        try {
          if (isFileExpired(uploadedAt, EXTRACTED_PDF_EXPIRY_HOURS)) {
            await del(url);
            removedFiles.push(url);
            removedCount++;
          }
        } catch (error) {
          logger.error(`Failed to delete blob: ${url}`, error);
        }
      }
      hasMore = blobsList.hasMore;
      cursor = blobsList.cursor;
    }
    return { removedCount, removedFiles };
  } catch (error) {
    logger.error(`Failed to delete uploads PDFs: ${error}`);
    throw error;
  }
}
