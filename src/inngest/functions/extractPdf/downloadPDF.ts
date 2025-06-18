import axios from 'axios';

export async function downloadPDF(downloadUrl: string): Promise<ArrayBuffer> {
  const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
  const uint8Array = new Uint8Array(response.data.data);
  return uint8Array.buffer;
}
