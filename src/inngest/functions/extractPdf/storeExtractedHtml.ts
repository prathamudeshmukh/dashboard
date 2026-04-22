import { put } from '@vercel/blob';

export async function storeExtractedHtml(
  pdfId: string,
  htmlContent: string,
  sampleJson: Record<string, string> | null,
): Promise<string> {
  const htmlBlob = await put(`uploads/${pdfId}/output/extracted.html`, htmlContent, {
    access: 'public',
    contentType: 'text/html',
    addRandomSuffix: false,
  });

  if (sampleJson !== null) {
    await put(`uploads/${pdfId}/output/sample.json`, JSON.stringify(sampleJson), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
  }

  return htmlBlob.url;
}
