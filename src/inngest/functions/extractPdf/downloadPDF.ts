import { Buffer } from 'node:buffer';

import axios from 'axios';

export async function downloadPDF(downloadUrl: string): Promise<Buffer> {
  const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
  const arrayBuffer = response.data as ArrayBuffer;
  return Buffer.from(arrayBuffer);
}
