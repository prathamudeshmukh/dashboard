import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchBlobMetadata } from './fetchBlobMetadata';
import { buildExtractPdfSteps } from './index';
import { pollConversionJob } from './pollConversionJob';
import { storeExtractedHtml } from './storeExtractedHtml';
import { submitConversionJob } from './submitConversionJob';
import { writeExtractionProgress } from './writeExtractionProgress';

vi.mock('./fetchBlobMetadata', () => ({
  fetchBlobMetadata: vi.fn(),
}));
vi.mock('./submitConversionJob', () => ({
  submitConversionJob: vi.fn(),
}));
vi.mock('./pollConversionJob', () => ({
  pollConversionJob: vi.fn(),
}));
vi.mock('./writeExtractionProgress', () => ({
  writeExtractionProgress: vi.fn(),
}));
vi.mock('./storeExtractedHtml', () => ({
  storeExtractedHtml: vi.fn(),
}));

const mockFetchBlobMetadata = fetchBlobMetadata as ReturnType<typeof vi.fn>;
const mockSubmitConversionJob = submitConversionJob as ReturnType<typeof vi.fn>;
const mockPollConversionJob = pollConversionJob as ReturnType<typeof vi.fn>;
const mockWriteExtractionProgress = writeExtractionProgress as ReturnType<typeof vi.fn>;
const mockStoreExtractedHtml = storeExtractedHtml as ReturnType<typeof vi.fn>;

function makeStepRun() {
  // step.run(name, fn) — executes fn synchronously
  return vi.fn((_name: string, fn: () => unknown) => fn());
}

function makeStep(overrides: Record<string, ReturnType<typeof vi.fn>> = {}) {
  return {
    run: makeStepRun(),
    sleep: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchBlobMetadata.mockResolvedValue({ downloadUrl: 'https://example.com/in.pdf' });
  mockSubmitConversionJob.mockResolvedValue({ jobId: 'job-123' });
  mockStoreExtractedHtml.mockResolvedValue('https://blob/output.html');
});

describe('buildExtractPdfSteps', () => {
  it('completes on first poll returning done', async () => {
    mockPollConversionJob.mockResolvedValue({
      status: 'done',
      html: '<p>hi</p>',
      sampleJson: null,
      pagesDone: 3,
      pagesTotal: 3,
    });

    const step = makeStep();
    await buildExtractPdfSteps('pdf-abc', step as any);

    expect(mockSubmitConversionJob).toHaveBeenCalledWith('https://example.com/in.pdf');
    expect(mockStoreExtractedHtml).toHaveBeenCalledWith('pdf-abc', '<p>hi</p>', null);
  });

  it('writes progress when pages_total > 0', async () => {
    mockPollConversionJob.mockResolvedValue({
      status: 'done',
      html: '<p>hi</p>',
      sampleJson: null,
      pagesDone: 2,
      pagesTotal: 2,
    });

    const step = makeStep();
    await buildExtractPdfSteps('pdf-abc', step as any);

    expect(mockWriteExtractionProgress).toHaveBeenCalledWith('pdf-abc', 2, 2);
  });

  it('does not write progress when pagesTotal is 0', async () => {
    mockPollConversionJob.mockResolvedValue({
      status: 'done',
      html: '<p>hi</p>',
      sampleJson: null,
      pagesDone: 0,
      pagesTotal: 0,
    });

    const step = makeStep();
    await buildExtractPdfSteps('pdf-abc', step as any);

    expect(mockWriteExtractionProgress).not.toHaveBeenCalled();
  });

  it('sleeps then retries on processing status', async () => {
    mockPollConversionJob
      .mockResolvedValueOnce({ status: 'processing', pagesDone: 1, pagesTotal: 3 })
      .mockResolvedValue({ status: 'done', html: '<p>ok</p>', sampleJson: null, pagesDone: 3, pagesTotal: 3 });

    const step = makeStep();
    await buildExtractPdfSteps('pdf-abc', step as any);

    expect(step.sleep).toHaveBeenCalledTimes(2);
    expect(mockPollConversionJob).toHaveBeenCalledTimes(2);
  });

  it('throws when job fails', async () => {
    mockPollConversionJob.mockResolvedValue({ status: 'failed', error: 'OpenAI quota exceeded' });

    const step = makeStep();

    await expect(buildExtractPdfSteps('pdf-abc', step as any)).rejects.toThrow(
      'OpenAI quota exceeded',
    );
  });

  it('throws after max polls exhausted', async () => {
    mockPollConversionJob.mockResolvedValue({ status: 'processing', pagesDone: 0, pagesTotal: 0 });

    const step = makeStep();

    await expect(buildExtractPdfSteps('pdf-abc', step as any)).rejects.toThrow(
      'timed out',
    );
  });
});
