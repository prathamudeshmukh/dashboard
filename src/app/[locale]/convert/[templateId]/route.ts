import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { type NextRequest, NextResponse } from 'next/server';

import { inngest } from '@/inngest/client';
import { addGeneratedTemplateHistory, generatePdf } from '@/libs/actions/templates';
import { trackServerEvent } from '@/libs/analytics/posthog-server';

import { authenticateApi } from '../../api/authenticateApi';
import { withApiAuth } from '../../api/withApiAuth';

// Create a single Upstash Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Define rate limiter: 4 requests per 60 seconds
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(4, '60 s'),
  analytics: true,
});

export const POST = withApiAuth(async (req: NextRequest, { params }: { params: { templateId: string } }): Promise<NextResponse> => {
  const start = Date.now();
  try {
    const authResult = await authenticateApi(req);
    if (authResult instanceof NextResponse) {
      return authResult; // Authentication failed
    }

    const clientId = req.headers.get('client_id');

    const { templateId } = params;

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is missing in the path' },
        { status: 400 },
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const devMode = searchParams.get('devMode') === 'true';

    let templateData;

    try {
      const body = await req.text();
      if (body) {
        const parsedBody = JSON.parse(body);
        if (!('templateData' in parsedBody)) {
          return NextResponse.json(
            { error: '"templateData" key is missing in the request body' },
            { status: 400 },
          );
        }
        templateData = parsedBody.templateData;
      }
    } catch (error) {
      console.warn(`No valid JSON body provided. Continuing with empty templateData: ${error}`);
    }

    // Apply rate limiting for users
    const key = `user:${clientId}`;
    const { success } = await ratelimit.limit(key);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Try again later.',
        },
        { status: 429 },
      );
    }

    const preferHeader = req.headers.get('Prefer');
    const modeParam = searchParams.get('mode');

    const isAsyncMode
      = preferHeader?.toLowerCase() === 'respond-async' || modeParam?.toLowerCase() === 'async';

    if (isAsyncMode) {
      // ------------------------------------------------
      // ⚡ ASYNC MODE: Trigger background job via Inngest
      // ------------------------------------------------

      // Send to Inngest queue (example event name)
      const { ids } = await inngest.send({
        name: 'pdf/generate.async',
        data: {
          clientId,
          templateId,
          templateData,
          devMode,
        },
      });

      return NextResponse.json(
        {
          status: 'accepted',
          job_id: ids[0],
          message: 'PDF generation request accepted for async processing',
        },
        {
          status: 202, // HTTP 202 Accepted
          headers: { 'Preference-Applied': 'respond-async' },
        },
      );
    }

    // ------------------------------------------------
    // 🧩 SYNC MODE: Generate PDF immediately
    // ------------------------------------------------

    const response = await generatePdf({
      devMode,
      templateId,
      templateData,
      isApi: true,
    });

    const renderTime = Date.now() - start; // ms

    if (response.error) {
      // ⚠️ Log failure
      await trackServerEvent('api_call_failed', {
        error_code: response.error.status?.toString() ?? 'unknown_error',
        duration: renderTime,
        template_id: templateId,
      });

      return NextResponse.json(
        { error: response.error.message },
        { status: response.error.status },
      );
    }

    await addGeneratedTemplateHistory({
      templateId,
      dataValue: templateData,
    });

    // ✅ Log success
    await trackServerEvent('api_call_generated_pdf', {
      job_id: crypto.randomUUID(),
      template_id: templateId,
      render_time: renderTime,
    });

    // Return the binary PDF file in the response
    return new NextResponse(response.pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="document.pdf"',
      },
    });
  } catch (error: any) {
    const duration = Date.now() - start;

    // ⚠️ Log exception as failed API call
    await trackServerEvent('api_call_failed', {
      error_code: 'exception',
      duration,
      template_id: params.templateId,
    });

    console.error('Error generating PDF [API Route]:', error);
    return NextResponse.json(
      { error: `Failed to generate PDF: ${error.message}` },
      { status: 500 },
    );
  }
});
