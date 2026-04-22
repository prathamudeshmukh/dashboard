import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { convertToHTML } from './convertToHtml';

vi.mock('axios');

const mockLogger = { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() };

describe('convertToHTML', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PDF_TO_HTML_BASE_URL = 'https://pdf-service.example.com';
    process.env.PDF_TO_HTML_TOKEN = 'test-token';
  });

  it('sends extract_variables:true in the request body', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { html: '<h1>Hello</h1>', sample_json: null },
    });

    await convertToHTML('https://example.com/file.pdf', mockLogger);

    expect(axios.post).toHaveBeenCalledWith(
      'https://pdf-service.example.com/convert',
      { pdf_url: 'https://example.com/file.pdf', extract_variables: true },
      expect.any(Object),
    );
  });

  it('returns html and sampleJson when service returns sample_json', async () => {
    const sampleJson = { '{{name}}': 'John Doe', '{{date}}': '2026-01-01' };
    vi.mocked(axios.post).mockResolvedValue({
      data: { html: '<h1>Invoice</h1>', sample_json: sampleJson },
    });

    const result = await convertToHTML('https://example.com/file.pdf', mockLogger);

    expect(result).toEqual({ html: '<h1>Invoice</h1>', sampleJson });
  });

  it('returns sampleJson as null when service omits the field', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { html: '<h1>Plain</h1>' },
    });

    const result = await convertToHTML('https://example.com/file.pdf', mockLogger);

    expect(result).toEqual({ html: '<h1>Plain</h1>', sampleJson: null });
  });

  it('returns sampleJson as null when service returns null', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { html: '<h1>Plain</h1>', sample_json: null },
    });

    const result = await convertToHTML('https://example.com/file.pdf', mockLogger);

    expect(result.sampleJson).toBeNull();
  });

  it('throws when the request fails', async () => {
    vi.mocked(axios.post).mockRejectedValue(new Error('Network error'));

    await expect(
      convertToHTML('https://example.com/file.pdf', mockLogger),
    ).rejects.toThrow('Network error');

    expect(mockLogger.error).toHaveBeenCalledWith('Conversion error', expect.any(Error));
  });
});
