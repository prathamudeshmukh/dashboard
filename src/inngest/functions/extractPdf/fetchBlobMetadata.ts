import { head } from '@vercel/blob';

export async function fetchBlobMetadata(pdfId: string) {
  const blobPath = `uploads/${pdfId}/input/in.pdf`;
  const blobDetails = await head(blobPath);

  if (!blobDetails.downloadUrl) {
    throw new Error('Missing download URL in blob metadata');
  }

  return { downloadUrl: blobDetails.downloadUrl };
}
