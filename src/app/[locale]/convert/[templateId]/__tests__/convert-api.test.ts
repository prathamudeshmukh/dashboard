import { Buffer } from 'node:buffer';

import express from 'express';
import { NextRequest } from 'next/server';
import request from 'supertest';
import { getResponse } from 'tests/apitest/helper';
import { startTestDb, stopTestDb } from 'tests/apitest/test-db';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import * as schema from '@/models/Schema';

import { encrypt } from '../../../../../service/crypto';

describe('Convert API Integration Tests', () => {
  let db: Awaited<ReturnType<typeof startTestDb>>['db'];
  let app: express.Application;
  let testClientId: string;
  let testClientSecret: string;
  let testTemplateId: string;
  let testUserId: string;
  let testUserEmail: string;

  beforeAll(async () => {
    const result = await startTestDb();
    db = result.db;
    /* eslint-disable no-console */
    console.log('Database Url: ', result.testDatabaseUrl);

    // Create Express app wrapper for supertest
    app = express();
    app.use(express.json());

    // Wrap Next.js route handler to work with Express
    app.post('/:locale/convert/:templateId', async (req, res) => {
      try {
        // Build URL with query parameters
        const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);

        // Add query parameters from req.query
        Object.entries(req.query || {}).forEach(([key, value]) => {
          if (typeof value === 'string') {
            url.searchParams.set(key, value);
          }
        });

        // Convert Express request body to string for NextRequest
        const bodyText = req.body ? JSON.stringify(req.body) : null;

        const nextRequest = new NextRequest(url, {
          method: req.method,
          headers: new Headers(req.headers as Record<string, string>),
          body: bodyText,
        });

        const { response } = await getResponse(nextRequest, req.params.templateId);

        // Copy status and headers
        res.status(response.status);
        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });

        // Handle response body
        if (response.headers.get('content-type')?.includes('application/pdf')) {
          const arrayBuffer = await response.arrayBuffer();
          res.send(Buffer.from(arrayBuffer));
        } else {
          const text = await response.text();
          try {
            const json = JSON.parse(text);
            res.json(json);
          } catch {
            res.send(text);
          }
        }
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
  }, 120000); // 2 minute timeout for container startup

  beforeEach(async () => {
    // Clean up database before each test
    await db.delete(schema.generated_templates);
    await db.delete(schema.templates);
    await db.delete(schema.apikeys);
    await db.delete(schema.users);

    // Create test user
    testUserId = `test-client-id-${Date.now()}`;
    testUserEmail = `test${Date.now()}@example.com`;

    await db.insert(schema.users).values({
      email: testUserEmail,
      username: 'Test User',
      clientId: testUserId,
      remainingBalance: 100, // Give user credits
    });

    // Generate and encrypt API keys
    testClientSecret = `cs_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const encryptedSecret = encrypt(testClientSecret);
    testClientId = testUserId;

    await db.insert(schema.apikeys).values({
      clientId: testClientId,
      clientSecret: encryptedSecret,
    });

    // Create test template
    const templateResult = await db
      .insert(schema.templates)
      .values({
        description: 'Test Template',
        templateName: 'Test Template',
        email: testUserEmail,
        templateContent: '<h1>Hello {{name}}</h1>',
        templateSampleData: { name: 'World' },
        templateStyle: 'body { font-family: Arial; }',
        templateType: 'handlebars-template',
        environment: 'dev',
        creationMethod: 'NEW_TEMPLATE',
      })
      .returning({ templateId: schema.templates.templateId });

    testTemplateId = templateResult[0]?.templateId || '';

    const row = await db.select().from(schema.users);
    const apikeysRow = await db.select().from(schema.apikeys);
    console.log('API Keys(convert-test):', apikeysRow);
    console.log('Users in DB:', row);
  });

  afterAll(async () => {
    await stopTestDb();
  });

  describe('POST /:locale/convert/:templateId', () => {
    it('should return 401 when client_id is missing', async () => {
      const response = await request(app)
        .post(`/en/convert/${testTemplateId}`)
        .set('client_secret', testClientSecret)
        .send({
          templateData: { name: 'Test' },
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Missing authentication credentials');
    });

    it('should return 401 when client_secret is missing', async () => {
      const response = await request(app)
        .post(`/en/convert/${testTemplateId}`)
        .set('client_id', testClientId)
        .send({
          templateData: { name: 'Test' },
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Missing authentication credentials');
    });

    it('should return 401 when client_secret is invalid', async () => {
      const response = await request(app)
        .post(`/en/convert/${testTemplateId}`)
        .set('client_id', testClientId)
        .set('client_secret', 'invalid-secret')
        .send({
          templateData: { name: 'Test' },
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid client_secret');
    });

    it('should return 400 when templateId is missing', async () => {
      const response = await request(app)
        .post('/en/convert/')
        .set('client_id', testClientId)
        .set('client_secret', testClientSecret)
        .send({
          templateData: { name: 'Test' },
        });

      // Express will return 404 for missing route parameter, but the handler would return 400
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Template ID is missing in the path');
    });
  });
});
