# Node.js & Express Coding Guidelines - Templify

This document provides Node.js and Express specific coding standards for the Templify job-runner service. It extends the [core-standards.md](core-standards.md) with Node.js-specific best practices.

**Always read [core-standards.md](core-standards.md) first** - this document assumes those principles.

---

## Table of Contents
- [Project Context](#project-context)
- [TypeScript Standards](#typescript-standards)
- [Express Patterns](#express-patterns)
- [Puppeteer Best Practices](#puppeteer-best-practices)
- [Error Handling](#error-handling)
- [Resource Management](#resource-management)
- [Security Best Practices](#security-best-practices)
- [Testing Standards](#testing-standards)
- [Performance & Scalability](#performance--scalability)

---

## Project Context

### Stack Overview (job-runner)
- **Framework**: Express.js
- **Language**: TypeScript
- **PDF Generation**: Puppeteer (Chromium)
- **Observability**: Sentry
- **Deployment**: Docker

### Project Structure
```
src/
├── index.ts                      # Express app & server
├── controller/
│   ├── generate-pdf/
│   │   └── index.ts             # PDF generation endpoint
│   └── extract-html/
│       └── index.ts             # HTML extraction endpoint
├── util/
│   ├── LeanPuppeteerHTMLPDF/
│   │   ├── index.ts            # PDF generation logic
│   │   └── BrowserPool.ts      # Browser instance pool
│   └── UploadImagesAndUpdateHTML/
│       ├── index.ts
│       ├── ReplaceImagePathsInHTML.ts
│       └── UploadAssets.ts
└── types/
    └── global.d.ts              # Type definitions
```

---

## TypeScript Standards

### Type Definitions

**Use explicit types for function signatures**
```typescript
// ✅ Good
async function generatePDF(
  html: string,
  options?: PDFOptions
): Promise<Buffer> {
  // ...
}

// ❌ Avoid
async function generatePDF(html, options) {
  // Missing types
}
```

**Define interfaces for complex data structures**
```typescript
// ✅ Good
type PDFOptions = {
  format?: 'A4' | 'Letter';
  margin?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  printBackground?: boolean;
  timeout?: number;
};

type PDFGenerationResult = {
  buffer: Buffer;
  pageCount: number;
  generationTime: number;
};
```

**Use type guards for runtime validation**
```typescript
function isPDFOptions(obj: unknown): obj is PDFOptions {
  return (
    typeof obj === 'object'
    && obj !== null
    && (!('format' in obj) || typeof obj.format === 'string')
  );
}

// Usage
if (isPDFOptions(requestBody)) {
  // Safe to use as PDFOptions
}
```

---

## Express Patterns

### Application Setup

```typescript
// index.ts
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';

// Load environment
dotenv.config();

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  _experiments: {
    enableLogs: true,
  },
});

const { logger } = Sentry;

// Validate critical env vars on startup
const requiredEnvVars = ['BEARER_TOKEN', 'SENTRY_DSN'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`${envVar} environment variable is not set. Exiting.`);
    process.exit(1);
  }
}

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' })); // Increase for large HTML payloads
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Routes
app.use('/generate-pdf', GeneratePDF);
app.use('/extract-html', ExtractHTML);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Error handlers
app.use(Sentry.Handlers.errorHandler());
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Graceful shutdown
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
```

### Middleware Pattern

**Authentication middleware**
```typescript
// middleware/bearerAuth.ts
import * as Sentry from '@sentry/node';
import { NextFunction, Request, Response } from 'express';

const { logger } = Sentry;

export function bearerAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Missing or invalid Authorization header', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(401).json({
      error: 'Missing or invalid Authorization header',
    });
    return;
  }

  const token = authHeader.substring(7); // Remove "Bearer "
  const expectedToken = process.env.BEARER_TOKEN;

  if (token !== expectedToken) {
    logger.warn('Invalid bearer token', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  next();
}
```

**Request validation middleware**
```typescript
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const PDFRequestSchema = z.object({
  html: z.string().min(1).max(5_000_000), // 5MB limit
  options: z.object({
    format: z.enum(['A4', 'Letter']).optional(),
    printBackground: z.boolean().optional(),
  }).optional(),
});

export function validatePDFRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    PDFRequestSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    } else {
      next(error);
    }
  }
}
```

### Controller Pattern

**Organize routes by feature**
```typescript
// controller/generate-pdf/index.ts
import * as Sentry from '@sentry/node';
import { Request, Response, Router } from 'express';

import { bearerAuth } from '../../middleware/bearerAuth';
import { validatePDFRequest } from '../../middleware/validation';
import { LeanPuppeteerHTMLPDF } from '../../util/LeanPuppeteerHTMLPDF';

const { logger } = Sentry;
const router = Router();

router.post(
  '/',
  bearerAuth,
  validatePDFRequest,
  async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();

    try {
      const { html, options } = req.body;

      logger.info('PDF generation requested', {
        htmlLength: html.length,
        options,
      });

      // Generate PDF
      const pdfBuffer = await LeanPuppeteerHTMLPDF.generatePDF(html, options);

      const duration = Date.now() - startTime;
      logger.info('PDF generated successfully', {
        duration,
        sizeBytes: pdfBuffer.length,
      });

      // Set headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="generated.pdf"'
      );

      // Send buffer
      res.send(pdfBuffer);
    } catch (error) {
      logger.error('PDF generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      Sentry.captureException(error, {
        tags: { operation: 'pdf-generation' },
      });

      res.status(500).json({
        error: 'PDF generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
```

---

## Puppeteer Best Practices

### Browser Pool Pattern

**Maintain a pool of browser instances**
```typescript
// util/LeanPuppeteerHTMLPDF/BrowserPool.ts
import * as Sentry from '@sentry/node';
import puppeteer, { Browser } from 'puppeteer';

const { logger } = Sentry;

class BrowserPool {
  private pool: Browser[] = [];
  private maxSize: number;
  private inUse: Set<Browser> = new Set();

  constructor(maxSize: number = 3) {
    this.maxSize = maxSize;
  }

  async acquire(): Promise<Browser> {
    // Reuse available browser
    for (const browser of this.pool) {
      if (!this.inUse.has(browser)) {
        const isConnected = browser.isConnected();

        if (isConnected) {
          this.inUse.add(browser);
          logger.debug('Reusing browser from pool');
          return browser;
        } else {
          // Remove disconnected browser
          this.pool = this.pool.filter(b => b !== browser);
        }
      }
    }

    // Create new browser if under limit
    if (this.pool.length < this.maxSize) {
      const browser = await this.createBrowser();
      this.pool.push(browser);
      this.inUse.add(browser);
      logger.info('Created new browser', { poolSize: this.pool.length });
      return browser;
    }

    // Wait for available browser
    logger.warn('Browser pool exhausted, waiting...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return this.acquire(); // Retry
  }

  release(browser: Browser): void {
    this.inUse.delete(browser);
    logger.debug('Released browser back to pool');
  }

  private async createBrowser(): Promise<Browser> {
    return await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // Important for Docker
        '--disable-extensions',
      ],
      executablePath: process.env.CHROME_BIN || undefined,
    });
  }

  async closeAll(): Promise<void> {
    logger.info('Closing all browsers', { count: this.pool.length });

    await Promise.all(
      this.pool.map(async (browser) => {
        try {
          await browser.close();
        } catch (error) {
          logger.error('Error closing browser', { error });
        }
      })
    );

    this.pool = [];
    this.inUse.clear();
  }
}

export const browserPool = new BrowserPool(3);
```

### PDF Generation

```typescript
// util/LeanPuppeteerHTMLPDF/index.ts
import * as Sentry from '@sentry/node';
import { Page, PDFOptions } from 'puppeteer';

import { browserPool } from './BrowserPool';

const { logger } = Sentry;

export class LeanPuppeteerHTMLPDF {
  static async generatePDF(
    html: string,
    options: Partial<PDFOptions> = {}
  ): Promise<Buffer> {
    const browser = await browserPool.acquire();
    let page: Page | null = null;

    try {
      page = await browser.newPage();

      // Set viewport
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 2,
      });

      // Set content with timeout
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000, // 30 seconds
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        printBackground: options.printBackground ?? true,
        margin: options.margin || {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm',
        },
        ...options,
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      logger.error('PDF generation error', {
        error: error instanceof Error ? error.message : 'Unknown',
        htmlLength: html.length,
      });

      throw new Error(
        `PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      // Clean up
      if (page) {
        try {
          await page.close();
        } catch (error) {
          logger.warn('Error closing page', { error });
        }
      }

      browserPool.release(browser);
    }
  }
}
```

### HTML Screenshot

```typescript
export class HTMLScreenshot {
  static async captureScreenshot(
    html: string,
    options: {
      width?: number;
      height?: number;
      fullPage?: boolean;
    } = {}
  ): Promise<Buffer> {
    const browser = await browserPool.acquire();
    let page: Page | null = null;

    try {
      page = await browser.newPage();

      await page.setViewport({
        width: options.width || 1920,
        height: options.height || 1080,
      });

      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: options.fullPage ?? true,
      });

      return Buffer.from(screenshot);
    } finally {
      if (page) {
        await page.close();
      }
      browserPool.release(browser);
    }
  }
}
```

---

## Error Handling

### Error Classes

```typescript
// types/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class PDFGenerationError extends AppError {
  constructor(message: string, cause?: Error) {
    super(message, 500, 'PDF_GENERATION_ERROR');
    if (cause) {
      this.stack += `\nCaused by: ${cause.stack}`;
    }
  }
}

export class TimeoutError extends AppError {
  constructor(operation: string, timeout: number) {
    super(
      `Operation '${operation}' timed out after ${timeout}ms`,
      408,
      'TIMEOUT_ERROR'
    );
  }
}
```

### Error Handler

```typescript
// middleware/errorHandler.ts
import * as Sentry from '@sentry/node';
import { NextFunction, Request, Response } from 'express';

import { AppError } from '../types/errors';

const { logger } = Sentry;

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Capture in Sentry
  Sentry.captureException(err, {
    tags: {
      url: req.url,
      method: req.method,
    },
    extra: {
      body: req.body,
      query: req.query,
    },
  });

  // Send response
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: 'details' in err ? (err as any).details : undefined,
    });
  } else {
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}
```

### Async Error Wrapper

```typescript
// util/asyncHandler.ts
import { NextFunction, Request, Response } from 'express';

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export function asyncHandler(handler: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

// Usage
router.post(
  '/generate-pdf',
  asyncHandler(async (req, res) => {
    const pdf = await generatePDF(req.body.html);
    res.send(pdf);
  })
);
```

---

## Resource Management

### Memory Management

**Monitor and limit memory usage**
```typescript
import * as Sentry from '@sentry/node';

const { logger } = Sentry;

// Log memory usage periodically
setInterval(() => {
  const usage = process.memoryUsage();
  logger.info('Memory usage', {
    rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
  });

  // Alert if memory is high
  const heapUsedMB = usage.heapUsed / 1024 / 1024;
  if (heapUsedMB > 1024) {
    logger.warn('High memory usage detected', { heapUsedMB });
  }
}, 60000); // Every minute
```

### Graceful Shutdown

```typescript
// util/gracefulShutdown.ts
import { Server } from 'node:http';

import * as Sentry from '@sentry/node';

import { browserPool } from './LeanPuppeteerHTMLPDF/BrowserPool';

const { logger } = Sentry;

export function setupGracefulShutdown(server: Server): void {
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, starting graceful shutdown`);

    // Stop accepting new connections
    server.close(() => {
      logger.info('HTTP server closed');
    });

    // Close browser pool
    try {
      await browserPool.closeAll();
      logger.info('Browser pool closed');
    } catch (error) {
      logger.error('Error closing browser pool', { error });
    }

    // Flush Sentry
    await Sentry.close(2000);

    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    Sentry.captureException(error);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason });
    Sentry.captureException(reason);
  });
}
```

### Timeout Management

```typescript
// util/timeout.ts
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new TimeoutError(operation, timeoutMs));
      }, timeoutMs);
    }),
  ]);
}

// Usage
const pdf = await withTimeout(
  generatePDF(html),
  30000,
  'PDF generation'
);
```

---

## Security Best Practices

### Input Sanitization

**Sanitize HTML input to prevent XSS**
```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'html',
      'head',
      'body',
      'div',
      'span',
      'p',
      'h1',
      'h2',
      'h3',
      'table',
      'tr',
      'td',
      'th',
      'img',
      'style',
      'link',
    ],
    ALLOWED_ATTR: ['class', 'id', 'style', 'src', 'href'],
    ALLOW_DATA_ATTR: false,
  });
}
```

### Rate Limiting

**Implement request rate limiting**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/generate-pdf', limiter);
```

### Content Security

**Validate content size**
```typescript
export function validateContentSize(
  html: string,
  maxSizeMB: number = 10
): void {
  const sizeBytes = Buffer.byteLength(html, 'utf8');
  const sizeMB = sizeBytes / 1024 / 1024;

  if (sizeMB > maxSizeMB) {
    throw new ValidationError(
      `HTML content too large: ${sizeMB.toFixed(2)}MB (max: ${maxSizeMB}MB)`
    );
  }
}
```

---

## Testing Standards

### Unit Tests

```typescript
// tests/generatePDF.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { LeanPuppeteerHTMLPDF } from '../src/util/LeanPuppeteerHTMLPDF';
import { browserPool } from '../src/util/LeanPuppeteerHTMLPDF/BrowserPool';

describe('PDF Generation', () => {
  afterAll(async () => {
    await browserPool.closeAll();
  });

  it('should generate PDF from simple HTML', async () => {
    const html = '<html><body><h1>Test</h1></body></html>';

    const buffer = await LeanPuppeteerHTMLPDF.generatePDF(html);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);

    // Verify PDF magic number
    const header = buffer.toString('utf8', 0, 4);

    expect(header).toBe('%PDF');
  });

  it('should handle complex HTML with styles', async () => {
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial; }
            .header { color: blue; }
          </style>
        </head>
        <body>
          <div class="header">Header</div>
          <p>Content</p>
        </body>
      </html>
    `;

    const buffer = await LeanPuppeteerHTMLPDF.generatePDF(html);

    expect(buffer.length).toBeGreaterThan(1000);
  });

  it('should throw error for invalid HTML', async () => {
    const html = '<invalid>';

    await expect(
      LeanPuppeteerHTMLPDF.generatePDF(html)
    ).rejects.toThrow();
  });
});
```

### Integration Tests

```typescript
// tests/api.test.ts
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import app from '../src/index';

describe('POST /generate-pdf', () => {
  const validToken = process.env.BEARER_TOKEN;

  it('should return 401 without auth token', async () => {
    const response = await request(app)
      .post('/generate-pdf')
      .send({ html: '<html></html>' });

    expect(response.status).toBe(401);
  });

  it('should generate PDF with valid request', async () => {
    const response = await request(app)
      .post('/generate-pdf')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        html: '<html><body>Test</body></html>',
      });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/pdf');
    expect(response.body).toBeInstanceOf(Buffer);
  });

  it('should return 400 for missing HTML', async () => {
    const response = await request(app)
      .post('/generate-pdf')
      .set('Authorization', `Bearer ${validToken}`)
      .send({});

    expect(response.status).toBe(400);
  });
});
```

### Load Tests (k6)

```javascript
// k6/load-test.js
import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users
    { duration: '1m', target: 10 }, // Stay at 10 users
    { duration: '30s', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests under 5s
    http_req_failed: ['rate<0.1'], // Less than 10% failures
  },
};

const HTML_PAYLOAD = `
  <html>
    <body>
      <h1>Load Test PDF</h1>
      <p>Generated at ${new Date().toISOString()}</p>
    </body>
  </html>
`;

export default function () {
  const response = http.post(
    `${__ENV.BASE_URL}/generate-pdf`,
    JSON.stringify({ html: HTML_PAYLOAD }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${__ENV.BEARER_TOKEN}`,
      },
    }
  );

  check(response, {
    'status is 200': r => r.status === 200,
    'content-type is PDF': r => r.headers['Content-Type'] === 'application/pdf',
    'response has body': r => r.body.length > 0,
  });

  sleep(1);
}
```

---

## Performance & Scalability

### Browser Pool Optimization

```typescript
// Adjust pool size based on CPU cores
import os from 'node:os';

const cpuCount = os.cpus().length;
const optimalPoolSize = Math.max(2, Math.floor(cpuCount * 0.75));

export const browserPool = new BrowserPool(optimalPoolSize);
```

### Response Streaming

**Stream large PDFs**
```typescript
router.post('/generate-pdf', async (req, res) => {
  const { html } = req.body;

  // For large PDFs, stream instead of buffering
  const browser = await browserPool.acquire();
  const page = await browser.newPage();

  try {
    await page.setContent(html);

    // Create write stream
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Generate and stream PDF
    const pdfStream = await page.createPDFStream();
    pdfStream.pipe(res);

    pdfStream.on('end', () => {
      browserPool.release(browser);
    });
  } catch (error) {
    await page.close();
    browserPool.release(browser);
    throw error;
  }
});
```

### Caching

```typescript
import NodeCache from 'node-cache';

// Cache PDFs for frequently requested templates
const pdfCache = new NodeCache({
  stdTTL: 600, // 10 minutes
  checkperiod: 120,
  maxKeys: 100,
});

export async function generatePDFWithCache(
  html: string,
  cacheKey?: string
): Promise<Buffer> {
  if (cacheKey) {
    const cached = pdfCache.get<Buffer>(cacheKey);
    if (cached) {
      logger.info('Cache hit', { cacheKey });
      return cached;
    }
  }

  const pdf = await LeanPuppeteerHTMLPDF.generatePDF(html);

  if (cacheKey) {
    pdfCache.set(cacheKey, pdf);
  }

  return pdf;
}
```

---

## Deployment & Docker

### Dockerfile Best Practices

```dockerfile
FROM node:18-alpine AS builder

# Install Chromium dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Chromium path
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont

ENV CHROME_BIN=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

---

## Checklist for Code Reviews

- [ ] All functions have TypeScript types
- [ ] Error handling is comprehensive
- [ ] Browser instances are properly released
- [ ] Memory leaks prevented (no leaked pages/contexts)
- [ ] Timeouts set for Puppeteer operations
- [ ] Authentication middleware applied to routes
- [ ] Input validation using Zod or similar
- [ ] Logging includes structured context
- [ ] Sentry captures exceptions
- [ ] Tests cover happy path and error cases
- [ ] Resource cleanup in finally blocks
- [ ] Graceful shutdown handlers
- [ ] Docker build optimized (multi-stage, minimal layers)

---

## Resources

- [Express Documentation](https://expressjs.com/)
- [Puppeteer Documentation](https://pptr.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Sentry Node.js](https://docs.sentry.io/platforms/node/)
- [Core Standards](./core-standards.md)
