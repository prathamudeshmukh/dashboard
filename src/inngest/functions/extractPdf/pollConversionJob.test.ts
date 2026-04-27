import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { pollConversionJob } from './pollConversionJob';

vi.mock('axios');
const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };

beforeEach(() => {
  vi.clearAllMocks();
  process.env.PDF_TO_HTML_BASE_URL = 'http://pdf-service';
  process.env.PDF_TO_HTML_TOKEN = 'test-token';
});

describe('pollConversionJob', () => {
  it('returns pending status with zero progress', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      status: 200,
      data: { status: 'pending', pages_done: 0, pages_total: 0 },
    });
    const result = await pollConversionJob('job-1');

    expect(result).toEqual({ status: 'pending', pagesDone: 0, pagesTotal: 0 });
  });

  it('returns processing status with progress', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      status: 200,
      data: { status: 'processing', pages_done: 2, pages_total: 5 },
    });
    const result = await pollConversionJob('job-1');

    expect(result).toEqual({ status: 'processing', pagesDone: 2, pagesTotal: 5 });
  });

  it('returns done status with full result', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      status: 200,
      data: {
        status: 'done',
        pages_done: 3,
        pages_total: 3,
        html: '<p>hi</p>',
        sample_json: { '{{name}}': 'Alice' },
        pages_processed: 3,
      },
    });
    const result = await pollConversionJob('job-1');

    expect(result).toEqual({
      status: 'done',
      pagesDone: 3,
      pagesTotal: 3,
      html: '<p>hi</p>',
      sampleJson: { '{{name}}': 'Alice' },
    });
  });

  it('returns failed status with error string', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      status: 200,
      data: { status: 'failed', error: 'OpenAI timeout' },
    });
    const result = await pollConversionJob('job-1');

    expect(result).toEqual({ status: 'failed', error: 'OpenAI timeout' });
  });

  it('throws on 404 (unexpected missing job)', async () => {
    const err = Object.assign(new Error('Not Found'), { response: { status: 404 } });
    mockedAxios.get = vi.fn().mockRejectedValue(err);

    await expect(pollConversionJob('job-1')).rejects.toThrow('Not Found');
  });

  it('calls the correct URL with auth header', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      status: 200,
      data: { status: 'pending', pages_done: 0, pages_total: 0 },
    });
    await pollConversionJob('job-abc');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://pdf-service/jobs/job-abc',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    );
  });
});
