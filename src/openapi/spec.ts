import type { OpenAPIV3 } from 'openapi-types';

const errorSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['error'],
  properties: {
    error: { type: 'string', description: 'Human-readable error message' },
  },
};

/**
 * SOURCE OF TRUTH: src/app/[locale]/convert/[templateId]/route.ts
 * Update this spec when changing that route.
 */
export const spec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Templify API',
    version: '1.0.0',
    description: [
      'API-first PDF generation platform.',
      'Create and manage Handlebars templates in the Templify dashboard,',
      'then generate PDFs by calling the `/convert/{templateId}` endpoint.',
      '',
      'Authentication uses two HTTP headers: `client_id` and `client_secret`.',
      'Retrieve these from the **API Keys** section of your dashboard.',
    ].join('\n'),
    contact: {
      name: 'Templify Support',
      email: 'support@templify.cloud',
      url: 'https://templify.cloud',
    },
  },
  servers: [
    {
      url: 'https://api.templify.cloud',
      description: 'Production',
    },
  ],
  components: {
    securitySchemes: {
      client_id: {
        type: 'apiKey',
        in: 'header',
        name: 'client_id',
        description: 'Your API Client ID — found in Dashboard → API Keys',
      },
      client_secret: {
        type: 'apiKey',
        in: 'header',
        name: 'client_secret',
        description: 'Your API Client Secret — found in Dashboard → API Keys',
      },
    },
    schemas: {
      ErrorResponse: errorSchema,
      AsyncResponse: {
        type: 'object',
        required: ['template_id', 'status', 'job_id'],
        properties: {
          template_id: {
            type: 'string',
            example: 'tmpl_123',
            description: 'The template that was queued for generation',
          },
          status: {
            type: 'string',
            enum: ['STARTED'],
            description: 'Always "STARTED" for a 202 response',
          },
          job_id: {
            type: 'string',
            example: '01HF4S8JAC9P7Z92K2N7Q3Y3G7',
            description: 'Unique job identifier — included in webhook payloads',
          },
        },
      },
    },
  },
  paths: {
    '/convert/{templateId}': {
      post: {
        operationId: 'generatePdf',
        summary: 'Generate a PDF from a template',
        description: [
          'Renders the specified template with the provided data and returns a PDF.',
          '',
          '**Sync mode** (default): returns the binary PDF directly.',
          '',
          '**Async mode**: triggered by `?runMode=async` or header `Prefer: respond-async`.',
          'Returns HTTP 202 immediately. Templify fires webhook events as the job progresses',
          '(`pdf.started`, `pdf.generated`, `pdf.failed`). Requires a configured webhook endpoint.',
          '',
          'Rate limit: **4 requests per 60 seconds** per user (sliding window).',
        ].join('\n'),
        security: [{ client_id: [], client_secret: [] }],
        parameters: [
          {
            name: 'templateId',
            in: 'path',
            required: true,
            description: 'The ID of the template to render. Visible in the dashboard URL.',
            schema: { type: 'string', example: 'tmpl_abc123' },
          },
          {
            name: 'devMode',
            in: 'query',
            required: false,
            description: [
              'When `true`, renders the latest **unpublished (dev)** version of the template.',
              'Defaults to `false` — omitting this parameter always uses the published (production) version.',
            ].join(' '),
            schema: { type: 'boolean', default: false },
          },
          {
            name: 'runMode',
            in: 'query',
            required: false,
            description: 'Set to `async` to trigger asynchronous PDF generation. Equivalent to `Prefer: respond-async` header.',
            schema: { type: 'string', enum: ['async'] },
          },
          {
            name: 'Prefer',
            in: 'header',
            required: false,
            description: 'Set to `respond-async` to trigger asynchronous PDF generation. Equivalent to `?runMode=async`.',
            schema: { type: 'string', enum: ['respond-async'] },
          },
        ],
        requestBody: {
          required: false,
          description: '`templateData` is optional. If omitted, the template renders with no variable substitution.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  templateData: {
                    type: 'object',
                    additionalProperties: true,
                    description: 'Key-value pairs injected into the Handlebars template. Shape depends on your template.',
                    example: {
                      name: 'John Doe',
                      invoice_number: 'INV-1001',
                      items: [
                        { description: 'Item 1', price: 20 },
                        { description: 'Item 2', price: 30 },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'PDF generated successfully. The response body is the raw binary PDF file — not JSON. Save the body directly as a `.pdf` file.',
            headers: {
              'Content-Disposition': {
                description: 'Always `attachment; filename="document.pdf"`',
                schema: { type: 'string', example: 'attachment; filename="document.pdf"' },
              },
            },
            content: {
              'application/pdf': {
                schema: { type: 'string', format: 'binary' },
              },
            },
          },
          202: {
            description: 'Async job accepted. PDF will be delivered via webhook once generation completes.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AsyncResponse' },
              },
            },
          },
          400: {
            description: 'Bad request — missing or malformed parameters (e.g. missing `templateData` key in body).',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: '"templateData" key is missing in the request body' },
              },
            },
          },
          401: {
            description: 'Authentication failed — missing or invalid `client_id` / `client_secret` headers.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Invalid client_secret' },
              },
            },
          },
          402: {
            description: 'Insufficient credits — your account balance is too low to generate a PDF.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Insufficient credits' },
              },
            },
          },
          404: {
            description: 'Template not found — the `templateId` does not exist or has no published version.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Template not found' },
              },
            },
          },
          429: {
            description: 'Rate limit exceeded — maximum 4 requests per 60 seconds per user.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Rate limit exceeded. Try again later.' },
              },
            },
          },
          500: {
            description: 'Unexpected server error.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Failed to generate PDF: internal error' },
              },
            },
          },
        },
      },
    },
  },
};
