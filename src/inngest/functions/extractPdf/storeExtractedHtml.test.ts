import { put } from '@vercel/blob';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { storeExtractedHtml } from './storeExtractedHtml';

vi.mock('@vercel/blob');

const fakeBlobResult = {
  url: 'https://blob.example.com/uploads/abc/output/extracted.html',
  downloadUrl: 'https://blob.example.com/uploads/abc/output/extracted.html',
  pathname: 'uploads/abc/output/extracted.html',
  contentType: 'text/html',
  contentDisposition: 'inline',
};

describe('storeExtractedHtml', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(put).mockResolvedValue(fakeBlobResult as any);
  });

  it('stores the HTML blob at the expected path', async () => {
    await storeExtractedHtml('abc', '<h1>Hi</h1>', null);

    expect(put).toHaveBeenCalledWith(
      'uploads/abc/output/extracted.html',
      '<h1>Hi</h1>',
      expect.objectContaining({ contentType: 'text/html', addRandomSuffix: false }),
    );
  });

  it('also stores sampleJson blob when sampleJson is non-null', async () => {
    const sampleJson = { '{{name}}': 'Alice' };
    await storeExtractedHtml('abc', '<h1>Hi</h1>', sampleJson);

    expect(put).toHaveBeenCalledTimes(2);
    expect(put).toHaveBeenCalledWith(
      'uploads/abc/output/sample.json',
      JSON.stringify(sampleJson),
      expect.objectContaining({ contentType: 'application/json', addRandomSuffix: false }),
    );
  });

  it('does NOT write sample.json blob when sampleJson is null', async () => {
    await storeExtractedHtml('abc', '<h1>Hi</h1>', null);

    expect(put).toHaveBeenCalledTimes(1);

    const calledPath = vi.mocked(put).mock.calls[0]?.[0];

    expect(calledPath).toBe('uploads/abc/output/extracted.html');
  });

  it('returns the HTML blob URL', async () => {
    const url = await storeExtractedHtml('abc', '<h1>Hi</h1>', null);

    expect(url).toBe('https://blob.example.com/uploads/abc/output/extracted.html');
  });
});
