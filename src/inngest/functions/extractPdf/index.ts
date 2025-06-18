import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { inngest } from '@/inngest/client';

import { cleanupDirectory } from './cleanupDirectory';
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
    // const localPdfPath = path.join(inputDir, 'in.pdf');
    const outputHtmlPath = path.join(outputDir, 'output');

    try {
      fs.mkdirSync(outputDir, { recursive: true });
      fs.mkdirSync(TMP_EXTRACT_DIR, { recursive: true });

      await step.run('list-tmp-directory', async () => {
        const tmpPath = tmpBase;
        const fs = await import('node:fs');
        const path = await import('node:path');

        function formatSize(bytes: number) {
          return bytes > 1024 * 1024
            ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
            : `${(bytes / 1024).toFixed(2)} KB`;
        }

        function walk(dir: string, depth = 0): string[] {
          const entries: string[] = [];
          const indent = '  '.repeat(depth);

          for (const entry of fs.readdirSync(dir)) {
            const entryPath = path.join(dir, entry);
            const stats = fs.statSync(entryPath);
            if (stats.isDirectory()) {
              entries.push(`${indent}📁 ${entry}/`);
              entries.push(...walk(entryPath, depth + 1));
            } else {
              entries.push(`${indent}📄 ${entry} — ${formatSize(stats.size)}`);
            }
          }

          return entries;
        }

        try {
          const listing = walk(tmpPath);
          logger.info(`📂 Recursive /tmp directory listing:\n${listing.join('\n')}`);
          return listing;
        } catch (err) {
          console.error('Error reading /tmp directory:', err);
          return [];
        }
      });

      await step.run('download-appryse-module', () =>
        downloadAppryseModule(TMP_ZIP_PATH, TMP_EXTRACT_DIR, logger));

      await step.run('extract-appryse-module', () =>
        extractAppryseModule(TMP_ZIP_PATH, TMP_EXTRACT_DIR, logger));

      const { downloadUrl } = await step.run('fetch-blob-metadata', () =>
        fetchBlobMetadata(pdfId));

      await step.run('download-pdf', () =>
        downloadPDF(downloadUrl, outputHtmlPath, TMP_EXTRACT_DIR));

      // await step.run('convert-to-html', () =>
      //   convertToHtml(pdfBuffer as ArrayBuffer, outputHtmlPath, TMP_EXTRACT_DIR));

      const htmlContent = await step.run('read-html', () =>
        readHtmlFile(outputHtmlPath));

      // Cleanup step - runs after successful completion
      await step.run('cleanup-temp-files', () =>
        cleanupDirectory({ directory: inputDir, logger }));

      return { htmlContent };
    } catch (error: any) {
      throw new Error(`Error during PDF processing: ${error.message}`);
    }
  },
);
