import { inngest } from '../../client';
import { convertToHTML } from './convertToHtml';
import { fetchBlobMetadata } from './fetchBlobMetadata';
import { storeExtractedHtml } from './storeExtractedHtml';

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
        convertToHTML(downloadUrl, logger, true));

      const htmlContentUrl = await step.run('store-extracted-html', () =>
        storeExtractedHtml(pdfId, htmlContent));

      logger.info('PDF extraction completed', {
        pdfId,
        html_length: htmlContent.length,
        html_preview: htmlContent.slice(0, 500),
        html_url: htmlContentUrl,
      });

      return { htmlContent };
    } catch (error: any) {
      throw new Error(`Error during PDF processing: ${error.message}`);
    }
  },
);
