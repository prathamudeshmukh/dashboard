import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { inngest } from '@/inngest/client';
import { db } from '@/libs/DB';
import { webhook_endpoints } from '@/models/Schema';

export async function handleAsyncMode(
  clientId: string,
  templateId: string,
  templateData: unknown,
  devMode: boolean,
) {
  // 1️⃣ Fetch webhook endpoint BEFORE triggering job
  const endpoint = await db.query.webhook_endpoints.findFirst({
    where: eq(webhook_endpoints.clientId, clientId),
  });

  if (!endpoint || !endpoint.url) {
    return NextResponse.json(
      { error: 'Webhook endpoint is not configured for this user. Please open settings and add a webhook URL under the Webhook Configuration.' },
      { status: 400 },
    );
  }
  const { ids } = await inngest.send({
    name: 'pdf/generate.async',
    data: {
      clientId,
      templateId,
      templateData,
      devMode,
      endpointId: endpoint.id,
      endpointUrl: endpoint.url,
      encryptedSecret: endpoint.encryptedSecret,
    },
  });

  return NextResponse.json(
    {
      template_id: templateId,
      status: 'STARTED',
      job_id: ids[0],
    },
    {
      status: 202,
      headers: {
        'Preference-Applied': 'respond-async',
      },
    },
  );
}
