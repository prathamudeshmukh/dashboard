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
    const { clientId, templateId, templateData, devMode, endpointId, endpointUrl, encryptedSecret } = event.data;

    // 1️⃣ -------------------------------------------------
    // Send "pdf.started"
    // ----------------------------------------------------
    await step.sendEvent('webhook.started', {
      name: 'webhook/send',
      data: {
        clientId,
        type: 'pdf.started',
        meta: {
          input_data: templateData,
          template_id: templateId,
          job_id: runId,
        },
        endpointId,
        endpointUrl,
      },
    });

    // 2️⃣ -------------------------------------------------
    // Generate PDF
    // ----------------------------------------------------

    let pdfBuffer: ArrayBuffer;
    const start = Date.now();

    try {
      const result = await generatePdf({
        devMode,
        templateId,
        templateData,
        isApi: true,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      pdfBuffer = result.pdf as ArrayBuffer;
    } catch (err: any) {
      // 3️⃣ -------------------------------------------------
      // Notify webhook about failure
      // ----------------------------------------------------
      await step.sendEvent('webhook.failed', {
        name: 'webhook/send',
        data: {
          clientId,
          type: 'pdf.failed',
          data: {
            error: {
              code: 'PDF_GENERATION_FAILED',
              message: err.message,
              details: null,
            },
            render_ms: Date.now() - start,
          },
          meta: {
            template_id: templateId,
            job_id: runId,
            dev_mode: devMode,
            input_data: templateData,
          },
          endpointId,
          endpointUrl,
        },
      });

      return { success: false, error: err.message };
    }

    // 4️⃣ -------------------------------------------------
    // Upload PDF
    // ----------------------------------------------------
    const date = new Date();
    const datePath = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    const storagePath = `generated-pdf/${clientId}/${datePath}/${runId}.pdf`;

    const blob = await put(storagePath, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf',
      addRandomSuffix: false,
    });

    const renderMs = Date.now() - start;

    // 5️⃣ -------------------------------------------------
    // Save DB record
    // ----------------------------------------------------
    await addGeneratedTemplateHistory({
      templateId,
      dataValue: templateData,
      inngestJobId: runId,
      generatedPdfUrl: blob.url,
      mode: 'ASYNC',
    });

    // 6️⃣ -------------------------------------------------
    // Send "pdf.generated"
    // ----------------------------------------------------
    await step.sendEvent('webhook.generated', {
      name: 'webhook/send',
      data: {
        clientId,
        type: 'pdf.generated',
        data: {
          template_id: templateId,
          job_id: runId,
          download_url: blob.url,
          render_ms: renderMs,
          expires_at: new Date(Date.now() + 24 * 60 * 60_000).toISOString(),
        },
        endpointId,
        endpointUrl,
        encryptedSecret,
      },
    });

    return { success: true, pdfUrl: blob.url };
  },
);
