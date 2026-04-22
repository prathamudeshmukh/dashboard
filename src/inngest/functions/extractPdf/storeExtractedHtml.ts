import { put } from '@vercel/blob';

export async function storeExtractedHtml(pdfId: string, htmlContent: string): Promise<string> {
  const blobPath = `uploads/${pdfId}/output/extracted.html`;
  const blob = await put(blobPath, htmlContent, {
    access: 'public',
    contentType: 'text/html',
    addRandomSuffix: false,
  });
  return blob.url;
}
