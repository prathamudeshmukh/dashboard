'use server';

import { head, put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

const inngestBaseUrl = process.env.INNGEST_GET_RUNS_BASE_URL;

export async function uploadPdf(formData: FormData) {
  const file = formData.get('pdf') as File;
  if (!file) {
    throw new Error('No File Selected');
  }

  const uuid = uuidv4();
  const blobPath = `uploads/${uuid}/input/in.pdf`;

  // Upload to Vercel Blob
  const blob = await put(blobPath, file, {
    access: 'public',
    addRandomSuffix: false,
  });

  if (!blob) {
    throw new Error('Error in File Uploading');
  }

  return {
    pdfId: uuid,
  };
}

export async function checkExtractionResult(pdfId: string): Promise<
  | { status: 'completed'; htmlContent: string; sampleJson: Record<string, string> | null }
  | { status: 'pending' }
> {
  try {
    const htmlBlob = await head(`uploads/${pdfId}/output/extracted.html`);
    const htmlResponse = await fetch(htmlBlob.url, { cache: 'no-store' });
    if (!htmlResponse.ok) {
      return { status: 'pending' };
    }
    const htmlContent = await htmlResponse.text();
    const sampleJson = await fetchSampleJson(pdfId);
    return { status: 'completed', htmlContent, sampleJson };
  } catch {
    return { status: 'pending' };
  }
}

async function fetchSampleJson(pdfId: string): Promise<Record<string, string> | null> {
  try {
    const jsonBlob = await head(`uploads/${pdfId}/output/sample.json`);
    const response = await fetch(jsonBlob.url, { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }
    return await response.json() as Record<string, string>;
  } catch {
    return null;
  }
}

export async function getStatus(runId: string) {
  const url = `${inngestBaseUrl}v1/events/${runId}/runs`;
  // eslint-disable-next-line no-console
  console.log('[getStatus] fetching:', url);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
    },
    cache: 'no-store',
  });

  // eslint-disable-next-line no-console
  console.log('[getStatus] response status:', response.status, response.statusText);

  if (!response.ok) {
    throw new Error(`Error fetching status: ${response.statusText}`);
  }

  const json = await response.json();
  // eslint-disable-next-line no-console
  console.log('[getStatus] raw json:', JSON.stringify(json));

  const run = json?.data?.[0];

  if (!run?.status) {
    return { status: 'pending', output: null };
  }

  return { status: run.status as string, output: run.output ?? null };
}
