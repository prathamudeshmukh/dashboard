import { Buffer } from 'node:buffer';
import fs from 'node:fs/promises';

import chromium from '@sparticuz/chromium';
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

  async setOptions(options: LeanPuppeteerHTMLPDFOptions): Promise<void> {
    this.options = options;
    await this.initializeBrowser();
  }

  async initializeBrowser(): Promise<void> {
    if (this.browser) {
      return;
    }

    try {
      this.browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });

      this.browser.on('disconnected', () => {
        this.browser = null;
      });

      this.browser.on('error', (error) => {
        console.error('Browser error:', error);
      });
    } catch (error: any) {
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
