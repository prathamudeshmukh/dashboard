/* eslint-disable no-console */
// Create a simple HTTP server for the worker
import { createServer } from 'node:http';

import { serve } from 'inngest/next';
import { NextRequest } from 'next/server';

import { inngest } from '@/inngest/client';
import { extractPdfContent } from '@/inngest/functions/extractPdf';
import { generateTemplatePreviewJob } from '@/inngest/functions/generatePreview';

// Create the Inngest handler
const handler = serve({
  client: inngest,
  functions: [
    extractPdfContent,
    generateTemplatePreviewJob,
  ],
});

const server = createServer(async (req, res) => {
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      environment: process.env.INNGEST_ENV,
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  // Handle Inngest requests
  if (req.url?.startsWith('/api/inngest')) {
    const nextReq = new NextRequest(req.url, {
      method: req.method,
      headers: req.headers as any,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? (req as any) : undefined,
    });

    try {
      const response = await handler(nextReq, { req, res });

      // Copy response headers
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      res.writeHead(response.status, response.statusText);

      // Copy response body
      const body = await response.text();
      res.end(body);
    } catch (error) {
      console.error('Worker error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
    return;
  }

  // Default response
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

const port = process.env.PORT || 3001;
const environment = process.env.INNGEST_ENV || 'development';

server.listen(port, () => {
  console.log(`🚀 Templify Worker running on port ${port} in ${environment} environment`);
  console.log(`�� Health check: http://localhost:${port}/health`);
  console.log(`🔗 Inngest endpoint: http://localhost:${port}/api/inngest`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Worker server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Worker server closed');
    process.exit(0);
  });
});

export { handler };
