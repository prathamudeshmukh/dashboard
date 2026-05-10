import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { submitConversionJob } from './submitConversionJob';

vi.mock('axios');
const mockedAxios = axios as unknown as { post: ReturnType<typeof vi.fn> };

const DOWNLOAD_URL = 'https://example.com/sample.pdf';

beforeEach(() => {
  vi.clearAllMocks();
  process.env.PDF_TO_HTML_BASE_URL = 'http://pdf-service';
  process.env.PDF_TO_HTML_TOKEN = 'test-token';
});

describe('submitConversionJob', () => {
  it('returns jobId on 202 response', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({ status: 202, data: { job_id: 'abc-123' } });
    const result = await submitConversionJob(DOWNLOAD_URL);

    expect(result).toEqual({ jobId: 'abc-123' });
  });

  it('posts to /convert/async with correct body and auth header', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({ status: 202, data: { job_id: 'x' } });
    await submitConversionJob(DOWNLOAD_URL);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://pdf-service/convert/async',
      { pdf_url: DOWNLOAD_URL, extract_variables: true, model: 'gpt-4o' },
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    );
  });

  it('throws a descriptive error on non-202 response', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({ status: 500, data: {} });

    await expect(submitConversionJob(DOWNLOAD_URL)).rejects.toThrow(
      'Unexpected status 500 from /convert/async',
    );
  });

  it('re-throws axios errors', async () => {
    mockedAxios.post = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(submitConversionJob(DOWNLOAD_URL)).rejects.toThrow('Network error');
  });
});
