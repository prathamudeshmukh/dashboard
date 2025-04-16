import fs from 'node:fs';
import path from 'node:path';

import { PDFNet } from '@pdftron/pdfnet-node';
import { head, put } from '@vercel/blob';
import axios from 'axios';

import { inngest } from '@/inngest/client';

export const extractPdfContent = inngest.createFunction(
  { id: 'extract-pdf' },
  { event: 'test/extract.pdf' },
  async ({ event, step }) => {
    const pdfId = event.data.pdfId;
    const inputDir = path.resolve('tmp', pdfId);
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
            throw new Error(`Error in fileToHtml:", ${err}`);
          }
        };

        await PDFNet.runWithCleanup(main, process.env.PDFTRON_LICENSE_KEY as string);
      });

      // Upload HTML back to blob storage
      const uploadedHtmlUrl = await step.run('upload-html', async () => {
        const htmlBuffer = fs.readFileSync(outputHtmlPath);
        const result = await put(`uploads/${pdfId}/output/out.html`, htmlBuffer, {
          access: 'public',
          addRandomSuffix: false,
        });
        return result.url;
      });

      return { htmlUrl: uploadedHtmlUrl };
    } catch (error: any) {
      throw new Error(`"Error during PDF processing", ${error}`);
    }
  },
);
