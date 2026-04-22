'use server';

import { put } from '@vercel/blob';
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
