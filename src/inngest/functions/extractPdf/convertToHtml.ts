import { Buffer } from 'node:buffer';
import path from 'node:path';

import { PDFNet } from '@pdftron/pdfnet-node';
import axios from 'axios';

export async function convertToHTML(downloadUrl: string, outputHtmlPath: string, resourceBasePath: string) {
  const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
  const pdfBuffer = Buffer.from(response.data);
  const main = async () => {
    await PDFNet.initialize();
    const resourcePath = path.join(resourceBasePath, '/Lib/Linux');
    await PDFNet.addResourceSearchPath(resourcePath);
    const pdfDoc = await PDFNet.PDFDoc.createFromBuffer(pdfBuffer);
    const htmlOptions = new PDFNet.Convert.HTMLOutputOptions();
    htmlOptions.setContentReflowSetting(PDFNet.Convert.HTMLOutputOptions.ContentReflowSetting.e_reflow_full);
    htmlOptions.setEmbedImages(false);
    await PDFNet.Convert.toHtml(pdfDoc, outputHtmlPath, htmlOptions);
  };

  await PDFNet.runWithCleanup(main, process.env.PDFTRON_LICENSE_KEY as string);
}
