'use server';

import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

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
