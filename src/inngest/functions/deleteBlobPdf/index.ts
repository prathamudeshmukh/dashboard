import { inngest } from '@/inngest/client';

import { deleteGeneratedPdf } from './deleteGeneratedPdf';
import { deleteUploadsPdf } from './deleteUploadsPdf';

export const deleteBlobPdf = inngest.createFunction(
  { id: 'delete-blob-pdf', name: 'Delete Blob PDF' },
  { cron: '0 0 */3 * *' }, // every 3 days at midnight IST
  async ({ logger }) => {
    try {
      await deleteUploadsPdf(logger);
      await deleteGeneratedPdf(logger);
      logger.info('Blob PDF Deletion Completed Successfully');
    } catch (error) {
      logger.error(`Failed to delete blob PDFs: ${error}`);
    }
  },
);
