import path from 'node:path';

import { PDFNet } from '@pdftron/pdfnet-node';

export async function convertToHtml(
  pdfBuffer: ArrayBuffer,
  outputHtmlPath: string,
  resourceBasePath: string,
) {
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
