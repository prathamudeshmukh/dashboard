import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { PDFNet } from '@pdftron/pdfnet-node';
import { head } from '@vercel/blob';
import AdmZip from 'adm-zip';
import axios from 'axios';

import { inngest } from '@/inngest/client';

const APPRYSE_MODULE_SDK_URL = 'https://www.pdftron.com/downloads/StructuredOutputLinuxArm64.tar.gz';
const tmpBase = tmpdir();
const TMP_ZIP_PATH = path.join(tmpBase, '/StructuredOutputLinuxArm64.tar.gz');
const TMP_EXTRACT_DIR = path.join(tmpBase, '/StructuredOutputModule/');
export const extractPdfContent = inngest.createFunction(
  { id: 'extract-html' },
  { event: 'upload/extract.html' },
  async ({ event, step }) => {
    process.env.LC_ALL = 'C';

    const pdfId = event.data.pdfId;

    const inputDir = path.join(tmpBase, pdfId);
    const outputDir = path.join(inputDir, 'output');
    const localPdfPath = path.join(inputDir, 'in.pdf');
    const outputHtmlPath = path.join(outputDir, 'output');

    try {
      fs.mkdirSync(outputDir, { recursive: true });

      await step.run('download-pdf-html-module', async () => {
        if (fs.existsSync(TMP_ZIP_PATH)) {
          // eslint-disable-next-line no-console
          console.log(`Module already found here : ${TMP_ZIP_PATH}`);
          return;
        }

        const response = await axios.get(APPRYSE_MODULE_SDK_URL, {
          responseType: 'stream',
        });

        await new Promise((resolve, reject) => {
          const writer = fs.createWriteStream(TMP_ZIP_PATH);
          response.data.pipe(writer);
          writer.on('finish', () => resolve(null));
          writer.on('error', reject);
        });

        const zip = new AdmZip(TMP_ZIP_PATH);
        zip.extractAllTo(TMP_EXTRACT_DIR, true);
      });

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
          await PDFNet.initialize();
          const resourcePath = path.join(TMP_EXTRACT_DIR, '/Lib/Linux');
          // eslint-disable-next-line no-console
          console.log('resourcePath:', resourcePath);
          await PDFNet.addResourceSearchPath(resourcePath);
          const htmlOutputOptions = new PDFNet.Convert.HTMLOutputOptions();
          htmlOutputOptions.setContentReflowSetting(PDFNet.Convert.HTMLOutputOptions.ContentReflowSetting.e_reflow_full);
          htmlOutputOptions.setEmbedImages(false);
          await PDFNet.Convert.fileToHtml(localPdfPath, outputHtmlPath, htmlOutputOptions);
        };
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
