'use server';

import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

const inngestBaseUrl = 'http://192.168.31.168:8288';

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
  if (!json.data[0].status) {
    throw new Error(`No status found for this RUN ID - ${runId}`);
  }

  return json.data[0].status;
}

/*
{
  run_id: '01HWAVJ8ASQ5C3FXV32JS9DV9Q',
  run_started_at: '2024-04-25T14:46:45.337Z',
  function_id: '6219fa64-9f58-41b6-95ec-a45c7172fa1e',
  function_version: 12,
  environment_id: '6219fa64-9f58-41b6-95ec-a45c7172fa1e',
  event_id: '01HWAVEB858VPPX47Z65GR6P6R',
  status: 'Completed',
  ended_at: '2024-04-25T14:46:46.896Z',
  output: {
    status: "success",
    processedItems: 98,
    failedItems: 2,
  }
}
*/
