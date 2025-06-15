/* eslint-disable no-console */
import { Buffer } from 'node:buffer';
import path from 'node:path';

import { PDFNet } from '@pdftron/pdfnet-node';

export async function convertToHtml(pdfBuffer: ArrayBuffer, outputHtmlPath: string, resourceBasePath: string) {
  const main = async () => {
    console.log('Buffer type:', typeof pdfBuffer);
    console.log('Buffer constructor:', pdfBuffer.constructor.name);
    console.log('Is Buffer:', Buffer.isBuffer(pdfBuffer));
    console.log('Is Uint8Array:', pdfBuffer instanceof Uint8Array);
    console.log('Buffer keys:', Object.keys(pdfBuffer).slice(0, 10)); // First 10 keys
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
