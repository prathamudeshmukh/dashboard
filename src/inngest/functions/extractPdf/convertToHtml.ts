import path from 'node:path';

import { PDFNet } from '@pdftron/pdfnet-node';

export async function convertToHtml(
  pdfBuffer: { type: string; data: number[] } | ArrayBuffer,
  outputHtmlPath: string,
  resourceBasePath: string,
) {
  const main = async () => {
    // Convert serialized buffer to proper ArrayBuffer if needed
    let arrayBuffer: ArrayBuffer;
    if (pdfBuffer instanceof ArrayBuffer) {
      arrayBuffer = pdfBuffer;
    } else if (pdfBuffer && typeof pdfBuffer === 'object' && 'data' in pdfBuffer) {
      // Handle {type: "Buffer", data: number[]} case
      const uint8Array = new Uint8Array(pdfBuffer.data);
      arrayBuffer = uint8Array.buffer;
    } else {
      throw new Error('Invalid buffer format');
    }

    await PDFNet.initialize();
    const resourcePath = path.join(resourceBasePath, '/Lib/Linux');
    await PDFNet.addResourceSearchPath(resourcePath);
    const pdfDoc = await PDFNet.PDFDoc.createFromBuffer(arrayBuffer);
    const htmlOptions = new PDFNet.Convert.HTMLOutputOptions();
    htmlOptions.setContentReflowSetting(PDFNet.Convert.HTMLOutputOptions.ContentReflowSetting.e_reflow_full);
    htmlOptions.setEmbedImages(false);
    await PDFNet.Convert.toHtml(pdfDoc, outputHtmlPath, htmlOptions);
  };

  await PDFNet.runWithCleanup(main, process.env.PDFTRON_LICENSE_KEY as string);
}
