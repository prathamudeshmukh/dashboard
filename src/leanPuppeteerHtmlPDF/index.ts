import { Buffer } from 'node:buffer';
import fs from 'node:fs/promises';

import chromium from '@sparticuz/chromium-min';
import type { Browser, Page, PDFOptions } from 'puppeteer-core';
import puppeteer from 'puppeteer-core';

export type LeanPuppeteerHTMLPDFOptions = {
  args?: string[];
  headless?: boolean;
  authorization?: string;
  browserWSEndpoint?: string;
  executablePath?: string;
  headers?: Record<string, string>;
  timeout?: number;
  printBackground?: boolean;
} & PDFOptions;

export class LeanPuppeteerHTMLPDF {
  private browser: Browser | null = null;
  private options: LeanPuppeteerHTMLPDFOptions | null = null;
  private autoCloseBrowser = true;
  private chromiumPath = 'https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar';

  constructor(options: LeanPuppeteerHTMLPDFOptions) {
    this.options = options;
  }

  async initializeBrowser(): Promise<void> {
    if (this.browser) {
      return;
    }

    try {
      const executablePath = await chromium.executablePath(this.chromiumPath);

      if (executablePath) {
        try {
          await fs.chmod(executablePath, '755'); // Give execute permission
        } catch (err) {
          console.error('Failed to set permissions for Chromium:', err);
        }
      }
      const launchArgs = [
        ...chromium.args,
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--single-process',
        '--no-zygote',
        '--disable-dev-shm-usage',
      ];
      this.browser = await puppeteer.launch({
        args: launchArgs,
        executablePath,
        headless: chromium.headless,
        defaultViewport: chromium.defaultViewport,
      });
    } catch (error: any) {
      console.error('Browser initialization failed:', {
        error: error.message,
      });
      throw new Error(`Failed to launch browser: ${error.message}`);
    }
  }

  private async getPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser is not initialized');
    }
    const page = await this.browser.newPage();
    this.setPageHeaders(page);
    return page;
  }

  async create(content: string): Promise<Buffer> {
    await this.initializeBrowser();
    const page = await this.getPage();

    const timeout = this.options?.timeout ? { timeout: this.options.timeout } : {};

    if (/^https?:\/\//.test(content)) {
      await page.goto(content, { waitUntil: ['load', 'networkidle0'], ...timeout });
    } else {
      await page.setContent(content, { waitUntil: 'networkidle0', ...timeout });
    }

    const pdfBuffer = await this.generatePDF(page);
    await this.closeBrowserIfNeeded();
    return pdfBuffer;
  }

  async writeFile(pdfBuffer: Buffer, filePath: string): Promise<string> {
    await fs.writeFile(filePath, pdfBuffer);
    return filePath;
  }

  async readFile(filePath: string, encoding: BufferEncoding): Promise<string> {
    return await fs.readFile(filePath, encoding);
  }

  setAutoCloseBrowser(flag: boolean): void {
    this.autoCloseBrowser = flag;
  }

  private setPageHeaders(page: Page): void {
    const headers = {
      ...(this.options?.authorization ? { Authorization: this.options.authorization } : {}),
      ...(this.options?.headers || {}),
    };

    if (Object.keys(headers).length > 0) {
      page.setExtraHTTPHeaders(headers);
    }
  }

  private async generatePDF(page: Page): Promise<Buffer> {
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: this.options?.printBackground ?? true,
    });

    return Buffer.from(pdfBuffer); // Convert Uint8Array to Buffer
  }

  private async closeBrowserIfNeeded(): Promise<void> {
    if (this.browser && this.autoCloseBrowser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
