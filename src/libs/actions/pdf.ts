'use server';

import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

const inngestBaseUrl = process.env.INNGEST_BASE_URL;

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
  const response = await fetch(`${inngestBaseUrl}/v1/events/${runId}/runs`, {
    headers: {
      Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
    },
  });
  const json = await response.json();
  if (!json?.data[0]?.status) {
    throw new Error(`No status found for this RUN ID - ${runId}`);
  }

  return { status: json?.data[0]?.status, output: json?.data[0]?.output };
}
