import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { inngest } from '@/inngest/client';

import { convertToHtml } from './convertToHtml';
import { downloadAppryseModule } from './downloadAppryseModule';
import { downloadPDF } from './downloadPDF';
import { extractAppryseModule } from './extractAppryseModule';
import { fetchBlobMetadata } from './fetchBlobMetadata';
import { readHtmlFile } from './readHtml';

const tmpBase = tmpdir();
const TMP_ZIP_PATH = path.join(tmpBase, '/StructuredOutputLinux.tar.gz');
const TMP_EXTRACT_DIR = path.join(tmpBase, '/StructuredOutputModule/');

export const extractPdfContent = inngest.createFunction(
  { id: 'extract-html' },
  { event: 'upload/extract.html' },
  async ({ event, step, logger }) => {
    process.env.LC_ALL = 'C';

    const pdfId = event.data.pdfId;
    const inputDir = path.join(tmpBase, pdfId);
    const outputDir = path.join(inputDir, 'output');
    const localPdfPath = path.join(inputDir, 'in.pdf');
    const outputHtmlPath = path.join(outputDir, 'output');

    try {
      fs.mkdirSync(outputDir, { recursive: true });
      fs.mkdirSync(TMP_EXTRACT_DIR, { recursive: true });

      await step.run('download-appryse-module', () =>
        downloadAppryseModule(TMP_ZIP_PATH, logger));

      await step.run('extract-appryse-module', () =>
        extractAppryseModule(TMP_ZIP_PATH, TMP_EXTRACT_DIR));

      const { downloadUrl } = await step.run('fetch-blob-metadata', () =>
        fetchBlobMetadata(pdfId));

      await step.run('download-pdf', () =>
        downloadPDF(downloadUrl, localPdfPath));

      await step.run('convert-to-html', () =>
        convertToHtml(localPdfPath, outputHtmlPath, TMP_EXTRACT_DIR));

      const htmlContent = await step.run('read-html', () =>
        readHtmlFile(outputHtmlPath));

      return { htmlContent };
    } catch (error: any) {
      throw new Error(`Error during PDF processing: ${error.message}`);
    }
  },
);
