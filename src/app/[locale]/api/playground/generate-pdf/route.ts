import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { templateGallery } from '@/models/Schema';
import contentGenerator from '@/service/contentGenerator';
import { generatePDFBuffer } from '@/service/generatePDFBuffer';

const redis = new Redis({
  url: process.env.RATE_LIMIT_KV_REST_API_URL!,
  token: process.env.RATE_LIMIT_KV_REST_API_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'),
  analytics: true,
});

const schema = z.object({
  galleryTemplateId: z.string().uuid(),
  templateData: z.record(z.unknown()).optional(),
});

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 },
    );
  }

  const { galleryTemplateId, templateData } = parsed.data;

  const ip = getClientIp(req);
  let rateLimitPassed = true;
  try {
    const { success } = await ratelimit.limit(`playground:${ip}`);
    rateLimitPassed = success;
  } catch {
    // fail open — do not block the user if Redis is unavailable
  }

  if (!rateLimitPassed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a few minutes.' },
      { status: 429 },
    );
  }

  const rows = await db
    .select()
    .from(templateGallery)
    .where(eq(templateGallery.id, galleryTemplateId))
    .limit(1)
    .catch(() => null);

  if (!rows || rows.length === 0) {
    return NextResponse.json(
      { error: 'Template not found.' },
      { status: 404 },
    );
  }

  const template = rows[0]!;

  let html: string;
  try {
    html = await contentGenerator({
      templateContent: template.handlebarContent ?? template.htmlContent,
      templateStyle: template.style ?? '',
      templateData: (templateData ?? template.sampleData ?? {}) as Record<string, unknown>,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Template compile error';
    return NextResponse.json({ error: message }, { status: 422 });
  }

  let pdfBuffer: ArrayBuffer;
  try {
    pdfBuffer = await generatePDFBuffer(html);
  } catch {
    return NextResponse.json(
      { error: 'PDF generation service unavailable. Try again shortly.' },
      { status: 503 },
    );
  }

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="document.pdf"',
    },
  });
}
