import { NextResponse } from 'next/server';

import { inngest } from '@/inngest/client';

export async function handleAsyncMode(
  clientId: string,
  templateId: string,
  templateData: unknown,
  devMode: boolean,
) {
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
