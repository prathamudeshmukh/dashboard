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

      const { html, sampleJson } = await step.run('convert-to-html', () =>
        convertToHTML(downloadUrl, logger));

      const htmlContentUrl = await step.run('store-extracted-html', () =>
        storeExtractedHtml(pdfId, html, sampleJson));

      logger.info('PDF extraction completed', {
        pdfId,
        html_length: html.length,
        html_preview: html.slice(0, 500),
        html_url: htmlContentUrl,
      });

      return { htmlContent: html };
    } catch (error: any) {
      throw new Error(`Error during PDF processing: ${error.message}`);
    }
  },
);
