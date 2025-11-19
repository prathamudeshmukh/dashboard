import { put } from '@vercel/blob';

import { inngest } from '@/inngest/client';
import { addGeneratedTemplateHistory, generatePdf } from '@/libs/actions/templates';

export const generatePdfAsync = inngest.createFunction(
  {
    id: 'pdf/generate.async',
    name: 'Generate PDF (Async)',
  },
  { event: 'pdf/generate.async' },
  async ({ event, step, runId }) => {
    const { clientId, templateId, templateData, devMode } = event.data;

    try {
      // 🧩 Generate and Upload PDF
      const blob = await step.run('generate-and-upload-pdf', async () => {
        const pdfResult = await generatePdf({ devMode, templateId, templateData, isApi: true });
        if (pdfResult.error) {
          throw new Error(pdfResult.error.message);
        }

        const date = new Date();
        const datePath = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
        const storagePath = `generated-pdf/${clientId}/${datePath}/${runId}.pdf`;

        return await put(storagePath, pdfResult.pdf as ArrayBuffer, {
          access: 'public',
          contentType: 'application/pdf',
          addRandomSuffix: false,
        });
      });

      // 🧩 Save record to DB
      return await step.run('save-db-record', async () => {
        await addGeneratedTemplateHistory({
          templateId,
          dataValue: templateData,
          inngestJobId: runId,
          generatedPdfUrl: blob.url,
          mode: 'ASYNC',
        });
      });
    } catch (err: any) {
      console.error('[Async PDF Error]', err);
      return { success: false, error: err.message };
    }
  },
);
