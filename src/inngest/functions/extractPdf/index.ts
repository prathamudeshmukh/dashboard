import { inngest } from '@/inngest/client';

import { fetchBlobMetadata } from './fetchBlobMetadata';

export const extractPdfContent = inngest.createFunction(
  { id: 'extract-html' },
  { event: 'upload/extract.html' },
  async ({ event, step, logger }) => {
    process.env.LC_ALL = 'C';
    const baseUrl = process.env.JOB_RUNNER_BASE_URL;
    const token = process.env.JOB_RUNNER_TOKEN;
    const pdfId = event.data.pdfId;

    try {
      const { downloadUrl } = await step.run('fetch-blob-metadata', () =>
        fetchBlobMetadata(pdfId));

      const response = await step.fetch(`${baseUrl}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ pdf_url: downloadUrl }),
      });

      // Inngest's step.fetch() automatically parses response.json()
      const data = await response.json();
      logger.info('Response', data);

      logger.info('PDF Extraction Completed Succesfully');

      return { htmlContent: data.html };
    } catch (error: any) {
      throw new Error(`Error during PDF processing: ${error.message}`);
    }
  },
);
