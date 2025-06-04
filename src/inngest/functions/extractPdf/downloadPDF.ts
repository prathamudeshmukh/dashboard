import fs from 'node:fs';

import axios from 'axios';

export async function downloadPDF(downloadUrl: string, localPdfPath: string) {
  const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
  fs.writeFileSync(localPdfPath, response.data);
}
