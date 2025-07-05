import { inngest } from '@/inngest/client';

import { convertToHTML } from './convertToHtml';
import { fetchBlobMetadata } from './fetchBlobMetadata';

export const extractPdfContent = inngest.createFunction(
  { id: 'extract-html' },
  { event: 'upload/extract.html' },
  async ({ event, step, logger }) => {
    process.env.LC_ALL = 'C';

    const pdfId = event.data.pdfId;

    try {
      const { downloadUrl } = await step.run('fetch-blob-metadata', () =>
        fetchBlobMetadata(pdfId));

      const htmlContent = await step.run('convert-to-html', () =>
        convertToHTML(downloadUrl, logger));

      logger.info('PDF Extraction Completed Succesfully');

      return { htmlContent };
    } catch (error: any) {
      throw new Error(`Error during PDF processing: ${error.message}`);
    }
  },
);
