import { Buffer } from 'node:buffer';

import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from './route';

// --- Hoisted mocks ---

const { mockDbSelect, mockLimit, mockRateLimitSuccess, mockContentGenerator, mockGeneratePDFBuffer } = vi.hoisted(() => {
  const mockLimit = vi.fn();
  const mockWhere = vi.fn();
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();

  mockSelect.mockReturnValue({ from: mockFrom });
  mockFrom.mockReturnValue({ where: mockWhere });
  mockWhere.mockReturnValue({ limit: mockLimit });

  return {
    mockDbSelect: mockSelect,
    mockLimit,
    mockRateLimitSuccess: vi.fn(),
    mockContentGenerator: vi.fn(),
    mockGeneratePDFBuffer: vi.fn(),
  };
});

vi.mock('@/libs/DB', () => ({
  db: { select: mockDbSelect },
}));

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: Object.assign(
    vi.fn().mockImplementation(() => ({
      limit: mockRateLimitSuccess,
    })),
    { slidingWindow: vi.fn() },
  ),
}));

vi.mock('@/service/contentGenerator', () => ({
  default: mockContentGenerator,
}));

vi.mock('@/service/generatePDFBuffer', () => ({
  generatePDFBuffer: mockGeneratePDFBuffer,
}));

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/en/api/playground/generate-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

const GALLERY_ROW = {
  id: VALID_UUID,
  title: 'Invoice',
  htmlContent: '<p>Hello {{name}}</p>',
  handlebarContent: '<p>Hello {{name}}</p>',
  style: 'body { color: red; }',
  sampleData: { name: 'World' },
  description: null,
  icon: null,
  color: null,
  category: null,
  previewHtmlContent: null,
  typeKey: 'invoice',
  variantName: null,
};

describe('POST /api/playground/generate-pdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRateLimitSuccess.mockResolvedValue({ success: true });
    mockContentGenerator.mockResolvedValue('<html><body>Hello World</body></html>');
    mockGeneratePDFBuffer.mockResolvedValue(Buffer.from('pdf-bytes'));
    mockLimit.mockResolvedValue([GALLERY_ROW]);
  });

  it('returns 200 with application/pdf on happy path', async () => {
    const res = await POST(makeRequest({ galleryTemplateId: VALID_UUID }));

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/pdf');
  });

  it('calls contentGenerator with gallery template content and sample data', async () => {
    await POST(makeRequest({ galleryTemplateId: VALID_UUID }));

    expect(mockContentGenerator).toHaveBeenCalledWith({
      templateContent: GALLERY_ROW.handlebarContent,
      templateStyle: GALLERY_ROW.style,
      templateData: GALLERY_ROW.sampleData,
    });
  });

  it('merges caller-supplied templateData over gallery sampleData', async () => {
    await POST(makeRequest({ galleryTemplateId: VALID_UUID, templateData: { name: 'Alice' } }));

    expect(mockContentGenerator).toHaveBeenCalledWith(
      expect.objectContaining({ templateData: { name: 'Alice' } }),
    );
  });

  it('returns 400 for invalid UUID', async () => {
    const res = await POST(makeRequest({ galleryTemplateId: 'not-a-uuid' }));

    expect(res.status).toBe(400);

    const body = await res.json();

    expect(body).toHaveProperty('error');
  });

  it('returns 400 when body is missing', async () => {
    const req = new NextRequest('http://localhost/en/api/playground/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 404 when gallery template is not found', async () => {
    mockLimit.mockResolvedValue([]);

    const res = await POST(makeRequest({ galleryTemplateId: VALID_UUID }));

    expect(res.status).toBe(404);

    const body = await res.json();

    expect(body.error).toMatch(/not found/i);
  });

  it('returns 429 when rate limit is exceeded', async () => {
    mockRateLimitSuccess.mockResolvedValue({ success: false });

    const res = await POST(makeRequest({ galleryTemplateId: VALID_UUID }));

    expect(res.status).toBe(429);

    const body = await res.json();

    expect(body.error).toMatch(/too many requests/i);
  });

  it('returns 422 when contentGenerator throws', async () => {
    mockContentGenerator.mockRejectedValue(new Error('Handlebars compile error'));

    const res = await POST(makeRequest({ galleryTemplateId: VALID_UUID }));

    expect(res.status).toBe(422);

    const body = await res.json();

    expect(body.error).toContain('Handlebars compile error');
  });

  it('returns 503 when generatePDFBuffer throws', async () => {
    mockGeneratePDFBuffer.mockRejectedValue(new Error('Connection refused'));

    const res = await POST(makeRequest({ galleryTemplateId: VALID_UUID }));

    expect(res.status).toBe(503);

    const body = await res.json();

    expect(body.error).toMatch(/unavailable/i);
  });

  it('fails open (allows request) when Redis is unavailable', async () => {
    mockRateLimitSuccess.mockRejectedValue(new Error('Redis down'));

    const res = await POST(makeRequest({ galleryTemplateId: VALID_UUID }));

    expect(res.status).toBe(200);
  });
});
