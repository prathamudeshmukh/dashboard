import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { PDFNet } from '@pdftron/pdfnet-node';
import { head } from '@vercel/blob';
import axios from 'axios';

import { inngest } from '@/inngest/client';

export const extractPdfContent = inngest.createFunction(
  { id: 'extract-html' },
  { event: 'upload/extract.html' },
  async ({ event, step }) => {
    const pdfId = event.data.pdfId;
    const tmpBase = tmpdir();
    const inputDir = path.join(tmpBase, pdfId);
    const outputDir = path.join(inputDir, 'output');
    const localPdfPath = path.join(inputDir, 'in.pdf');
    const outputHtmlPath = path.join(outputDir, 'output');

    try {
      fs.mkdirSync(outputDir, { recursive: true });

      const metadata = await step.run('fetch-blob-metadata', async () => {
        const blobPath = `uploads/${pdfId}/input/in.pdf`;
        const blobDetails = await head(blobPath);

        if (!blobDetails.downloadUrl) {
          throw new Error('Missing download URL in blob metadata');
        }

        return { downloadUrl: blobDetails.downloadUrl };
      });

      await step.run('download-pdf', async () => {
        const response = await axios.get(metadata.downloadUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(localPdfPath, response.data);
      });

      await step.run('convert-to-html', async () => {
        const main = async () => {
          try {
            await PDFNet.initialize();
            const resourcePath = path.join(process.cwd(), 'node_modules/@pdftron/pdfnet-node/lib/Windows');
            await PDFNet.addResourceSearchPath(resourcePath);
            const htmlOutputOptions = new PDFNet.Convert.HTMLOutputOptions();
            htmlOutputOptions.setContentReflowSetting(PDFNet.Convert.HTMLOutputOptions.ContentReflowSetting.e_reflow_full);
            htmlOutputOptions.setEmbedImages(false);
            await PDFNet.Convert.fileToHtml(localPdfPath, outputHtmlPath, htmlOutputOptions);
          } catch (err) {
            throw new Error(`Error in convert pdf to html:", ${err}`);
          }
        };
        // eslint-disable-next-line no-console
        console.info('PDFTRON_LICENSE_KEY', process.env.PDFTRON_LICENSE_KEY);
        await PDFNet.runWithCleanup(main, process.env.PDFTRON_LICENSE_KEY as string);
      });

      const htmlContent = await step.run('read-html', async () => {
        const htmlBuffer = fs.readFileSync(outputHtmlPath);
        return htmlBuffer.toString(); // Convert buffer to string
      });

      return { htmlContent };
    } catch (error: any) {
      throw new Error(`"Error during PDF processing", ${error}`);
    }
  },
);
