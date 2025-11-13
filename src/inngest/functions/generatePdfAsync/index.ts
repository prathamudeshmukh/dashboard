import { put } from '@vercel/blob';

import { inngest } from '@/inngest/client';
import { generatePdf } from '@/libs/actions/templates';
import { db } from '@/libs/DB';
import { generated_templates } from '@/models/Schema';

export const generatePdfAsync = inngest.createFunction(
  {
    id: 'pdf/generate.async',
    name: 'Generate PDF (Async)',
  },
  { event: 'pdf/generate.async' },
  async ({ event }) => {
    const { clientId, templateId, templateData, jobId, devMode } = event.data;

    try {
      // 🧩 Generate PDF
      const result = await generatePdf({ devMode, templateId, templateData, isApi: true });
      if (result.error) {
        throw new Error(result.error.message);
      }

      // 🧩 Upload PDF
      const date = new Date();
      const datePath = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      const storagePath = `generated-pdf/${clientId}/${datePath}/${jobId}.pdf`;

      const blob = await put(storagePath, result.pdf as ArrayBuffer, {
        access: 'public',
        contentType: 'application/pdf',
        addRandomSuffix: false,
      });

      // 🧩 Save record
      await db.insert(generated_templates).values({
        template_id: templateId,
        data_value: templateData,
        inngestJobId: jobId,
        mode: 'ASYNC',
      });

      return { success: true, pdfUrl: blob.url, jobId };
    } catch (err: any) {
      console.error('[Async PDF Error]', err);
      return { success: false, error: err.message };
    }
  },
);
