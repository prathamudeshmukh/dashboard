import { inngest } from '@/inngest/client';
import type { TemplatePreviewJobData } from '@/types/Template';

import { generatePDF } from './generatePDF';
import { updatePreviewURL } from './updatePreviewURL';
import { uploadPDF } from './uploadPDF';

export const generateTemplatePreviewJob = inngest.createFunction(
  {
    id: 'template-generate-preview',
    name: 'Generate Template Preview PDF',
    retries: 3,
    concurrency: {
      limit: 5,
    },
  },
  { event: 'template/generate-preview' },
  async ({ event, step, logger }) => {
    const { templateId } = event.data as TemplatePreviewJobData;

    logger.info('Starting template preview generation', { templateId });

    const pdfResult = await step.run('generate-pdf', () =>
      generatePDF(templateId, logger));

    const blobResult = await step.run('upload-to-blob', () =>
      uploadPDF(pdfResult, templateId, logger));

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
  },
);
