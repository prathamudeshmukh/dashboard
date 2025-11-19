import { serve } from 'inngest/next';

import { inngest } from '@/inngest/client';
import { extractPdfContent } from '@/inngest/functions/extractPdf';
import { generatePdfAsync } from '@/inngest/functions/generatePdfAsync';
import { generateTemplatePreviewJob } from '@/inngest/functions/generatePreview';

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    extractPdfContent,
    generateTemplatePreviewJob,
    generatePdfAsync,
  ],
});
