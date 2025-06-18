import path from 'node:path';

import { PDFNet } from '@pdftron/pdfnet-node';
import axios from 'axios';

export async function downloadPDF(downloadUrl: string, outputHtmlPath: string, resourceBasePath: string) {
  const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
  const uint8Array = new Uint8Array(response.data.data);
  const main = async () => {
    await PDFNet.initialize();
    const resourcePath = path.join(resourceBasePath, '/Lib/Linux');
    await PDFNet.addResourceSearchPath(resourcePath);
    const pdfDoc = await PDFNet.PDFDoc.createFromBuffer(uint8Array);
    const htmlOptions = new PDFNet.Convert.HTMLOutputOptions();
    htmlOptions.setContentReflowSetting(PDFNet.Convert.HTMLOutputOptions.ContentReflowSetting.e_reflow_full);
    htmlOptions.setEmbedImages(false);
    await PDFNet.Convert.toHtml(pdfDoc, outputHtmlPath, htmlOptions);
  };

  await PDFNet.runWithCleanup(main, process.env.PDFTRON_LICENSE_KEY as string);
}
