import { head } from '@vercel/blob';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkExtractionResult } from './pdf';

vi.mock('@vercel/blob');
vi.mock('uuid', () => ({ v4: vi.fn(() => 'mocked-uuid') }));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const HTML_BLOB_URL = 'https://blob.example.com/uploads/abc/output/extracted.html';
const JSON_BLOB_URL = 'https://blob.example.com/uploads/abc/output/sample.json';

describe('checkExtractionResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns pending when HTML blob does not exist', async () => {
    vi.mocked(head).mockRejectedValue(new Error('Not found'));

    const result = await checkExtractionResult('abc');

    expect(result).toEqual({ status: 'pending' });
  });

  it('returns pending when HTML fetch fails', async () => {
    vi.mocked(head).mockResolvedValue({ url: HTML_BLOB_URL } as any);
    mockFetch.mockResolvedValueOnce({ ok: false });

    const result = await checkExtractionResult('abc');

    expect(result).toEqual({ status: 'pending' });
  });

  it('returns completed with sampleJson when both blobs exist', async () => {
    const sampleJson = { '{{name}}': 'Alice', '{{date}}': '2026-01-01' };

    vi.mocked(head)
      .mockResolvedValueOnce({ url: HTML_BLOB_URL } as any)
      .mockResolvedValueOnce({ url: JSON_BLOB_URL } as any);

    mockFetch
      .mockResolvedValueOnce({ ok: true, text: async () => '<h1>Invoice</h1>' })
      .mockResolvedValueOnce({ ok: true, json: async () => sampleJson });

    const result = await checkExtractionResult('abc');

    expect(result).toEqual({
      status: 'completed',
      htmlContent: '<h1>Invoice</h1>',
      sampleJson,
    });
  });

  it('returns completed with sampleJson null when JSON blob does not exist', async () => {
    vi.mocked(head)
      .mockResolvedValueOnce({ url: HTML_BLOB_URL } as any)
      .mockRejectedValueOnce(new Error('Not found'));

    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => '<h1>Invoice</h1>' });

    const result = await checkExtractionResult('abc');

    expect(result).toEqual({
      status: 'completed',
      htmlContent: '<h1>Invoice</h1>',
      sampleJson: null,
    });
  });

  it('returns completed with sampleJson null when JSON fetch fails', async () => {
    vi.mocked(head)
      .mockResolvedValueOnce({ url: HTML_BLOB_URL } as any)
      .mockResolvedValueOnce({ url: JSON_BLOB_URL } as any);

    mockFetch
      .mockResolvedValueOnce({ ok: true, text: async () => '<h1>Hi</h1>' })
      .mockResolvedValueOnce({ ok: false });

    const result = await checkExtractionResult('abc');

    expect(result).toEqual({
      status: 'completed',
      htmlContent: '<h1>Hi</h1>',
      sampleJson: null,
    });
  });
});
