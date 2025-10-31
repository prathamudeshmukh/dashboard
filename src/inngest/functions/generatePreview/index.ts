import type { TemplatePreviewJobData } from '../../../types/Template';
import { inngest } from '../../client';
import { GenerateAnduploadPDF } from './generateAndUploadPDF';
import { updatePreviewURL } from './updatePreviewURL';

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
      const blobResult = await step.run('generate-pdf-and-upload-to-blob', () =>
        GenerateAnduploadPDF(templateId, logger));

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
