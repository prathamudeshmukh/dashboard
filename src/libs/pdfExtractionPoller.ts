import type { checkExtractionResult } from '@/libs/actions/pdf';
import type { trackEvent } from '@/libs/analytics/trackEvent';

type CheckFn = typeof checkExtractionResult;
type TrackFn = typeof trackEvent;

type StoreActions = {
  setHtmlContent: (html: string) => void;
  setHandlebarsCode: (code: string) => void;
  setHandlebarTemplateJson: (json: string) => void;
};

type PollCallbacks = {
  onCompleted: () => void;
  onFailed: () => void;
};

const MAX_POLL_MS = 5 * 60 * 1000;

export async function pollExtractionJob(
  pdfId: string,
  file: File,
  extractionStart: number,
  store: StoreActions,
  callbacks: PollCallbacks,
  check: CheckFn,
  track: TrackFn,
): Promise<void> {
  try {
    while (Date.now() - extractionStart < MAX_POLL_MS) {
      await new Promise<void>(resolve => setTimeout(resolve, 3000));
      const result = await check(pdfId);

      if (result.status === 'completed') {
        store.setHtmlContent(result.htmlContent);
        store.setHandlebarsCode(result.htmlContent);
        store.setHandlebarTemplateJson(
          result.sampleJson !== null
            ? JSON.stringify(result.sampleJson, null, 2)
            : '{}',
        );
        callbacks.onCompleted();
        track('template_imported_from_pdf', {
          pdf_id: pdfId,
          file_name: file.name,
          file_size: file.size,
          extraction_time: Date.now() - extractionStart,
          html_length: result.htmlContent.length,
        });
        return;
      }
    }

    callbacks.onFailed();
    track('template_import_failed', {
      pdf_id: pdfId,
      file_name: file.name,
      file_size: file.size,
      failure_stage: 'extraction',
      error_message: 'Extraction timed out',
    });
  } catch (error) {
    callbacks.onFailed();
    track('template_import_failed', {
      pdf_id: pdfId,
      file_name: file.name,
      file_size: file.size,
      failure_stage: 'extraction',
      error_message: error instanceof Error ? error.message : String(error),
    });
  }
}
