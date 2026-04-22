import { beforeEach, describe, expect, it, vi } from 'vitest';

import { pollExtractionJob } from './pdfExtractionPoller';

vi.useFakeTimers();

const mockCheck = vi.fn();
const mockTrack = vi.fn();

const setHtmlContent = vi.fn();
const setHandlebarsCode = vi.fn();
const setHandlebarTemplateJson = vi.fn();
const onCompleted = vi.fn();
const onFailed = vi.fn();

const store = { setHtmlContent, setHandlebarsCode, setHandlebarTemplateJson };
const callbacks = { onCompleted, onFailed };
const testFile = new File(['%PDF'], 'invoice.pdf', { type: 'application/pdf' });

async function runPoll() {
  const promise = pollExtractionJob('pdf-123', testFile, Date.now(), store, callbacks, mockCheck, mockTrack);
  await vi.advanceTimersByTimeAsync(3100);
  return promise;
}

describe('pollExtractionJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets handlebarTemplateJson with serialised sampleJson on completion', async () => {
    const sampleJson = { '{{name}}': 'Alice', '{{date}}': '2026-01-01' };
    mockCheck.mockResolvedValue({ status: 'completed', htmlContent: '<h1>Hi</h1>', sampleJson });

    await runPoll();

    expect(setHandlebarTemplateJson).toHaveBeenCalledWith(
      JSON.stringify(sampleJson, null, 2),
    );
  });

  it('sets handlebarTemplateJson to {} when sampleJson is null', async () => {
    mockCheck.mockResolvedValue({ status: 'completed', htmlContent: '<h1>Hi</h1>', sampleJson: null });

    await runPoll();

    expect(setHandlebarTemplateJson).toHaveBeenCalledWith('{}');
  });

  it('sets htmlContent and handlebarsCode on completion', async () => {
    mockCheck.mockResolvedValue({ status: 'completed', htmlContent: '<h1>Invoice</h1>', sampleJson: null });

    await runPoll();

    expect(setHtmlContent).toHaveBeenCalledWith('<h1>Invoice</h1>');
    expect(setHandlebarsCode).toHaveBeenCalledWith('<h1>Invoice</h1>');
  });

  it('calls onCompleted and tracks event on success', async () => {
    mockCheck.mockResolvedValue({ status: 'completed', htmlContent: '<h1>Hi</h1>', sampleJson: null });

    await runPoll();

    expect(onCompleted).toHaveBeenCalledOnce();
    expect(mockTrack).toHaveBeenCalledWith('template_imported_from_pdf', expect.objectContaining({
      pdf_id: 'pdf-123',
    }));
  });

  it('calls onFailed and tracks event on timeout', async () => {
    mockCheck.mockResolvedValue({ status: 'pending' });

    const promise = pollExtractionJob('pdf-123', testFile, Date.now() - 5 * 60 * 1000 - 1, store, callbacks, mockCheck, mockTrack);
    await vi.advanceTimersByTimeAsync(100);
    await promise;

    expect(onFailed).toHaveBeenCalledOnce();
    expect(mockTrack).toHaveBeenCalledWith('template_import_failed', expect.objectContaining({
      failure_stage: 'extraction',
      error_message: 'Extraction timed out',
    }));
  });

  it('calls onFailed and tracks error when check throws', async () => {
    mockCheck.mockRejectedValue(new Error('Network error'));

    await runPoll();

    expect(onFailed).toHaveBeenCalledOnce();
    expect(mockTrack).toHaveBeenCalledWith('template_import_failed', expect.objectContaining({
      failure_stage: 'extraction',
      error_message: 'Network error',
    }));
  });
});
