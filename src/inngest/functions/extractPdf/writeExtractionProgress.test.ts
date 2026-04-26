import { put } from '@vercel/blob';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { writeExtractionProgress } from './writeExtractionProgress';

vi.mock('@vercel/blob', () => ({ put: vi.fn().mockResolvedValue({}) }));

const mockedPut = put as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => vi.clearAllMocks());

describe('writeExtractionProgress', () => {
  it('writes progress JSON to the correct Blob path', async () => {
    await writeExtractionProgress('pdf-abc', 2, 5);

    expect(mockedPut).toHaveBeenCalledWith(
      'uploads/pdf-abc/status/progress.json',
      JSON.stringify({ pagesDone: 2, pagesTotal: 5 }),
      expect.objectContaining({ access: 'public', addRandomSuffix: false }),
    );
  });

  it('overwrites on repeated calls (same path each time)', async () => {
    await writeExtractionProgress('pdf-abc', 3, 5);
    await writeExtractionProgress('pdf-abc', 5, 5);

    expect(mockedPut).toHaveBeenCalledTimes(2);

    const lastCall = mockedPut.mock.calls[1] as unknown[];

    expect(lastCall[0]).toBe('uploads/pdf-abc/status/progress.json');
    expect(lastCall[1]).toBe(JSON.stringify({ pagesDone: 5, pagesTotal: 5 }));
  });
});
