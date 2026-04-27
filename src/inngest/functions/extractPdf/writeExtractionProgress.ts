import { put } from '@vercel/blob';

export async function writeExtractionProgress(
  pdfId: string,
  pagesDone: number,
  pagesTotal: number,
): Promise<void> {
  await put(
    `uploads/${pdfId}/status/progress.json`,
    JSON.stringify({ pagesDone, pagesTotal }),
    { access: 'public', contentType: 'application/json', addRandomSuffix: false },
  );
}
