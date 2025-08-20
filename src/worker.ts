/* eslint-disable no-console */
// Create a simple HTTP server for the worker
import { createServer } from 'node:http';

import { serve } from 'inngest/next';
import { NextRequest } from 'next/server';

import { inngest } from './inngest/client';
import { extractPdfContent } from './inngest/functions/extractPdf';
import { generateTemplatePreviewJob } from './inngest/functions/generatePreview';

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
    // Log the incoming request for debugging
    console.log(`📥 Inngest request: ${req.method} ${req.url}`);
    console.log(`📋 Headers:`, Object.keys(req.headers));

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const requestOptions: any = {
      method: req.method,
      headers: req.headers as any,
    };

    // Add body and duplex option for non-GET/HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      requestOptions.body = req as any;
      requestOptions.duplex = 'half';
    }

    const nextReq = new NextRequest(url, requestOptions);

    try {
      const response = await handler(nextReq, { req, res });

      // Copy response headers
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      res.writeHead(response.status, response.statusText);

      // Copy response body
      const body = await response.text();
      console.log(`📤 Inngest response: ${response.status} ${response.statusText}`);
      res.end(body);
    } catch (error) {
      console.error('Worker error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
    return;
  }

  // Inngest registration endpoint
  if (req.url === '/api/inngest/register') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      functions: [
        {
          id: 'extract-html',
          name: 'Extract PDF Content',
          triggers: [{ event: 'upload/extract.html' }],
        },
        {
          id: 'generate-preview',
          name: 'Generate Template Preview',
          triggers: [{ event: 'template/generate.preview' }],
        },
      ],
      client: {
        id: 'templify-app',
        env: process.env.INNGEST_ENV || 'development',
      },
    }));
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
  console.log(`🏥 Health check: http://localhost:${port}/health`);
  console.log(`🔗 Inngest endpoint: http://localhost:${port}/api/inngest`);
  console.log(`📝 Inngest registration: http://localhost:${port}/api/inngest/register`);
  console.log(`🔑 Inngest Event Key: ${process.env.INNGEST_EVENT_KEY ? 'Set' : 'Not set'}`);
  console.log(`🔐 Inngest Signing Key: ${process.env.INNGEST_SIGNING_KEY ? 'Set' : 'Not set'}`);
  console.log(`🌐 Inngest Base URL: ${process.env.INNGEST_BASE_URL || 'Not set'}`);
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
