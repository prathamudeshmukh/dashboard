import { Buffer } from 'node:buffer';

import { put } from '@vercel/blob';

import { inngest } from '@/inngest/client';
import { generatePdf, updateTemplatePreviewURL } from '@/libs/actions/templates';
import type { TemplatePreviewJobData } from '@/types/Template';

export const generateTemplatePreviewJob = inngest.createFunction(
  {
    id: 'template-generate-preview',
    name: 'Generate Template Preview PDF',
    retries: 3,
    concurrency: {
      limit: 5, // Process up to 5 preview generations concurrently
    },
  },
  { event: 'template/generate-preview' },
  async ({ event, step, logger }) => {
    const { templateId } = event.data as TemplatePreviewJobData;

    logger.info('Starting template preview generation', { templateId });

    // Step 1: Generate PDF from template
    const pdfResult = await step.run('generate-pdf', async () => {
      logger.info('Generating PDF for template', { templateId });

      const result = await generatePdf({ templateId });

      if (result.error) {
        throw new Error(`PDF generation failed: ${result.error}`);
      }

      if (!result.pdf) {
        throw new Error('PDF generation returned empty result');
      }

      return result.pdf;
    });

    // Step 2: Upload PDF to Vercel Blob
    const blobResult = await step.run('upload-to-blob', async () => {
      logger.info('Uploading PDF to Vercel Blob', { templateId });

      try {
        const pdfBuffer = Buffer.from(pdfResult, 'base64');
        const filename = `${templateId}.pdf`;

        const blob = await put(filename, pdfBuffer, {
          access: 'public',
          contentType: 'application/pdf',
          addRandomSuffix: false, // Keep consistent filename
        });

        logger.info('PDF uploaded successfully', {
          templateId,
          url: blob.url,
          size: pdfBuffer.length,
        });

        return blob;
      } catch (error) {
        logger.error('Failed to upload PDF to blob', { templateId, error });
        throw new Error(`Blob upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    // Step 3: Update database with preview URL
    await step.run('update-database', async () => {
      logger.info('Updating database with preview URL', { templateId });

      try {
        const updateResult = await updateTemplatePreviewURL({
          templateId,
          previewURL: blobResult.url,
        });

        logger.info('Database updated successfully', {
          templateId,
          previewURL: blobResult.url,
        });

        return updateResult;
      } catch (error) {
        logger.error('Failed to update database', { templateId, error });
        throw new Error(`Database update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    logger.info('Template preview generation completed successfully', {
      templateId,
      previewURL: blobResult.url,
    });

    return {
      success: true,
      templateId,
      previewURL: blobResult.url,
      message: 'Template preview generated successfully',
    };
  },
);
