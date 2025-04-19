import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { inngest } from '@/inngest/client';
import { uploadPdf } from '@/libs/actions/pdf';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await uploadPdf(formData);

    const { ids } = await inngest.send({
      name: 'upload/extract.html',
      data: {
        pdfId: result.pdfId,
      },
    });

    const runID = ids[0];
    return NextResponse.json({ result, runID });
  } catch (err: any) {
    throw new Error (`PDF Extraction Failed ${err}`);
  }
}
