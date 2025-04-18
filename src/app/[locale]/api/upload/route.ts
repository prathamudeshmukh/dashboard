import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { inngest } from '@/inngest/client';
import { uploadPdf } from '@/libs/actions/pdf';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await uploadPdf(formData);

    const { ids } = await inngest.send({
      name: 'test/extract.pdf',
      data: {
        pdfId: result.pdfId,
      },
    });

    const run_id = ids[0];
    return NextResponse.json({ result, run_id });
  } catch (err: any) {
    throw new Error (`Something went wrong ${err}`);
  }
}
