import axios from 'axios';

export async function downloadPDF(downloadUrl: string): Promise<ArrayBuffer> {
  const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
  return response.data as ArrayBuffer;
}
