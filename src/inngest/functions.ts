import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { PDFNet } from '@pdftron/pdfnet-node';
import { head, put } from '@vercel/blob';
import axios from 'axios';
import * as tar from 'tar';

import { inngest } from '@/inngest/client';
import { generatePdf, updateTemplatePreviewURL } from '@/libs/actions/templates';
import type { TemplatePreviewJobData } from '@/types/Template';

const APPRYSE_MODULE_SDK_URL = 'https://www.pdftron.com/downloads/StructuredOutputLinux.tar.gz';
const tmpBase = tmpdir();
const TMP_ZIP_PATH = path.join(tmpBase, '/StructuredOutputLinux.tar.gz');
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
      fs.mkdirSync(TMP_EXTRACT_DIR, { recursive: true });

      await step.run('download-appryse-module', async () => {
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
      });

      await step.run('extract-appryse-module', async () => {
        await tar.x({
          file: TMP_ZIP_PATH,
          cwd: TMP_EXTRACT_DIR, // target folder
        });
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

export const generateTemplatePreviewJob = inngest.createFunction(
  {
    id: 'template-generate-preview',
    name: 'Generate Template Preview PDF',
    retries: 3,
    concurrency: {
      limit: 5, // Process up to 5 preview generations concurrently
    },
  },
  { event: 'template/generate-preview' },
  async ({ event, step, logger }) => {
    const { templateId } = event.data as TemplatePreviewJobData;

    logger.info('Starting template preview generation', { templateId });

    // Step 1: Generate PDF from template
    const pdfResult = await step.run('generate-pdf', async () => {
      logger.info('Generating PDF for template', { templateId });

      const result = await generatePdf({ templateId });

      if (result.error) {
        throw new Error(`PDF generation failed: ${result.error}`);
      }

      if (!result.pdf) {
        throw new Error('PDF generation returned empty result');
      }

      return result.pdf;
    });

    // Step 2: Upload PDF to Vercel Blob
    const blobResult = await step.run('upload-to-blob', async () => {
      logger.info('Uploading PDF to Vercel Blob', { templateId });

      try {
        const pdfBuffer = Buffer.from(pdfResult, 'base64');
        const filename = `${templateId}.pdf`;

        const blob = await put(filename, pdfBuffer, {
          access: 'public',
          contentType: 'application/pdf',
          addRandomSuffix: false, // Keep consistent filename
        });

        logger.info('PDF uploaded successfully', {
          templateId,
          url: blob.url,
          size: pdfBuffer.length,
        });

        return blob;
      } catch (error) {
        logger.error('Failed to upload PDF to blob', { templateId, error });
        throw new Error(`Blob upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    // Step 3: Update database with preview URL
    await step.run('update-database', async () => {
      logger.info('Updating database with preview URL', { templateId });

      try {
        const updateResult = await updateTemplatePreviewURL({
          templateId,
          previewURL: blobResult.url,
        });

        logger.info('Database updated successfully', {
          templateId,
          previewURL: blobResult.url,
        });

        return updateResult;
      } catch (error) {
        logger.error('Failed to update database', { templateId, error });
        throw new Error(`Database update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    logger.info('Template preview generation completed successfully', {
      templateId,
      previewURL: blobResult.url,
    });

    return {
      success: true,
      templateId,
      previewURL: blobResult.url,
      message: 'Template preview generated successfully',
    };
  },
);
