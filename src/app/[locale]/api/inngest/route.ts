import { serve } from 'inngest/next';

import { inngest } from '@/inngest/client';
import { deleteBlobPdf } from '@/inngest/functions/deleteBlobPdf';
import { extractPdfContent } from '@/inngest/functions/extractPdf';
import { generatePdfAsync } from '@/inngest/functions/generatePdfAsync';
import { generateTemplatePreviewJob } from '@/inngest/functions/generatePreview';
import { sendWebhook } from '@/inngest/functions/webhook/sendWebhook';

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    extractPdfContent,
    generateTemplatePreviewJob,
    generatePdfAsync,
    sendWebhook,
    deleteBlobPdf,
  ],
});
