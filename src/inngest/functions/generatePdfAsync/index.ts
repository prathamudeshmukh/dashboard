import { put } from '@vercel/blob';

import { inngest } from '@/inngest/client';
import { fetchTemplateById, generatePdf } from '@/libs/actions/templates';
import { db } from '@/libs/DB';
import { generated_templates } from '@/models/Schema';

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
      await step.run('save-db-record', async () => {
        // fetch template to get the template id (PK) from for the template
        const fetchedTemplate = await fetchTemplateById(templateId);

        await db.insert(generated_templates).values({
          template_id: fetchedTemplate.data?.id as string,
          data_value: templateData,
          inngestJobId: runId,
          generated_pdf_url: blob.url,
          completedAt: new Date(),
          mode: 'ASYNC',
        });
      });

      // 🧩 Return success result
      return await step.run('return-success', async () => ({
        success: true,
        pdfUrl: blob.url,
      }));
    } catch (err: any) {
      console.error('[Async PDF Error]', err);
      return { success: false, error: err.message };
    }
  },
);
