import { inngest } from '../../client';
import { fetchBlobMetadata } from './fetchBlobMetadata';
import { pollConversionJob } from './pollConversionJob';
import { storeExtractedHtml } from './storeExtractedHtml';
import { submitConversionJob } from './submitConversionJob';
import { writeExtractionProgress } from './writeExtractionProgress';

const MAX_POLL_ATTEMPTS = Number(process.env.MAX_POLL_ATTEMPTS ?? '10');

type InngestStep = {
  run: (name: string, fn: () => unknown) => Promise<unknown>;
  sleep: (name: string, duration: string) => Promise<void>;
};

export async function buildExtractPdfSteps(pdfId: string, step: InngestStep): Promise<void> {
  const { downloadUrl } = (await step.run('fetch-blob-metadata', () =>
    fetchBlobMetadata(pdfId))) as Awaited<ReturnType<typeof fetchBlobMetadata>>;

  const { jobId } = (await step.run('submit-conversion-job', () =>
    submitConversionJob(downloadUrl))) as Awaited<ReturnType<typeof submitConversionJob>>;

  let html: string | undefined;
  let sampleJson: Record<string, string> | null = null;

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await step.sleep(`wait-30s-attempt-${attempt}`, '30s');

    const pollResult = (await step.run(`poll-attempt-${attempt}`, async () => {
      const status = await pollConversionJob(jobId);
      if (status.status !== 'failed' && status.pagesTotal > 0) {
        await writeExtractionProgress(pdfId, status.pagesDone, status.pagesTotal);
      }
      return status;
    })) as Awaited<ReturnType<typeof pollConversionJob>>;

    if (pollResult.status === 'done') {
      html = pollResult.html;
      sampleJson = pollResult.sampleJson;
      break;
    }

    if (pollResult.status === 'failed') {
      throw new Error(pollResult.error);
    }
  }

  if (html === undefined) {
    throw new Error(`PDF extraction timed out after ${MAX_POLL_ATTEMPTS} polls`);
  }

  await step.run('store-extracted-html', () =>
    storeExtractedHtml(pdfId, html, sampleJson));
}

export const extractPdfContent = inngest.createFunction(
  { id: 'extract-html' },
  { event: 'upload/extract.html' },
  async ({ event, step, logger }) => {
    process.env.LC_ALL = 'C';
    const pdfId = event.data.pdfId as string;

    try {
      await buildExtractPdfSteps(pdfId, step);
      logger.info('PDF extraction completed', { pdfId });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error during PDF processing: ${message}`);
    }
  },
);
