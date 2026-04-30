import { Buffer } from 'node:buffer';

import { put } from '@vercel/blob';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchTemplateById } from '@/libs/actions/templates';

import { GenerateAnduploadPDF } from './generateAndUploadPDF';
import { generatePdfWorker } from './generatePdfWorker';

vi.mock('@vercel/blob');
vi.mock('@/libs/actions/templates');
vi.mock('./generatePdfWorker');

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
};

const fakeTemplate = {
  templateContent: '<p>Hello</p>',
  templateStyle: '',
  templateSampleData: {},
};

const fakeBlobResult = {
  url: 'https://example.com/tpl-123.pdf',
  downloadUrl: 'https://example.com/tpl-123.pdf?download=1',
  pathname: 'tpl-123.pdf',
  contentType: 'application/pdf',
  contentDisposition: 'inline',
};

describe('GenerateAnduploadPDF', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes a Buffer (not a raw ArrayBuffer) to put()', async () => {
    const rawArrayBuffer = new ArrayBuffer(8);
    vi.mocked(fetchTemplateById).mockResolvedValue({ data: fakeTemplate as any });
    vi.mocked(generatePdfWorker).mockResolvedValue({ pdf: rawArrayBuffer });
    vi.mocked(put).mockResolvedValue(fakeBlobResult as any);

    await GenerateAnduploadPDF('tpl-123', mockLogger);

    const bodyArg = vi.mocked(put).mock.calls.at(0)?.[1];

    expect(Buffer.isBuffer(bodyArg)).toBe(true);
    expect(bodyArg).toEqual(Buffer.from(rawArrayBuffer));
  });

  it('uses the templateId as the blob filename', async () => {
    vi.mocked(fetchTemplateById).mockResolvedValue({ data: fakeTemplate as any });
    vi.mocked(generatePdfWorker).mockResolvedValue({ pdf: new ArrayBuffer(4) });
    vi.mocked(put).mockResolvedValue(fakeBlobResult as any);

    await GenerateAnduploadPDF('tpl-abc', mockLogger);

    const filenameArg = vi.mocked(put).mock.calls.at(0)?.[0];

    expect(filenameArg).toBe('tpl-abc.pdf');
  });

  it('returns the blob result on success', async () => {
    vi.mocked(fetchTemplateById).mockResolvedValue({ data: fakeTemplate as any });
    vi.mocked(generatePdfWorker).mockResolvedValue({ pdf: new ArrayBuffer(4) });
    vi.mocked(put).mockResolvedValue(fakeBlobResult as any);

    const result = await GenerateAnduploadPDF('tpl-123', mockLogger);

    expect(result).toEqual(fakeBlobResult);
  });

  it('throws when fetchTemplateById returns an error', async () => {
    vi.mocked(fetchTemplateById).mockResolvedValue({ error: { message: 'template not found', status: 404 } });

    await expect(GenerateAnduploadPDF('missing-id', mockLogger)).rejects.toThrow('Blob upload failed');
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to upload PDF to blob',
      expect.objectContaining({ templateId: 'missing-id' }),
    );
  });

  it('throws when generatePdfWorker returns no pdf buffer', async () => {
    vi.mocked(fetchTemplateById).mockResolvedValue({ data: fakeTemplate as any });
    vi.mocked(generatePdfWorker).mockResolvedValue({} as any);

    await expect(GenerateAnduploadPDF('tpl-empty', mockLogger)).rejects.toThrow('Blob upload failed');
  });

  it('throws and logs when put() rejects', async () => {
    vi.mocked(fetchTemplateById).mockResolvedValue({ data: fakeTemplate as any });
    vi.mocked(generatePdfWorker).mockResolvedValue({ pdf: new ArrayBuffer(4) });
    vi.mocked(put).mockRejectedValue(new Error('Blob service unavailable'));

    await expect(GenerateAnduploadPDF('tpl-err', mockLogger)).rejects.toThrow('Blob upload failed: Blob service unavailable');
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to upload PDF to blob',
      expect.objectContaining({ templateId: 'tpl-err' }),
    );
  });
});
