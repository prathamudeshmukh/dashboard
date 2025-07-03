import { inngest } from '@/inngest/client';
import type { TemplatePreviewJobData } from '@/types/Template';

import { generatePDF } from './generatePDF';
import { updatePreviewURL } from './updatePreviewURL';
import { uploadPDF } from './uploadPDF';

type GenerateTemplatePreviewResult = {
  success: boolean;
  templateId: string;
  previewURL?: string;
  message: string;
};

export const generateTemplatePreviewJob = inngest.createFunction(
  {
    id: 'template-generate-preview',
    name: 'Generate Template Preview PDF',
    retries: 3,
    concurrency: {
      limit: 3,
    },
  },
  { event: 'template/generate-preview' },
  async ({ event, step, logger }): Promise<GenerateTemplatePreviewResult> => {
    const { templateId } = event.data as TemplatePreviewJobData;

    logger.info('Starting template preview generation', { templateId });

    try {
      const pdfResult = await step.run('generate-pdf', async () => {
        try {
          return await generatePDF(templateId, logger);
        } catch (error) {
          if (error instanceof Error && error.message.includes('ENOSPC')) {
            logger.error('Disk space error during PDF generation', { templateId, error: error.message });
            // You might want to trigger a cleanup job or alert here
            throw new Error('Server storage full. Please try again later.');
          }
          throw error;
        }
      });

      const blobResult = await step.run('upload-to-blob', () =>
        uploadPDF(pdfResult as ArrayBuffer, templateId, logger));

      await step.run('update-database', () =>
        updatePreviewURL(templateId, blobResult.url, logger));

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
    } catch (error) {
      logger.error('Template preview generation failed', { templateId, error });

      return {
        success: false,
        templateId,
        message: 'Template preview generation failed',
      };
    }
  },
);
