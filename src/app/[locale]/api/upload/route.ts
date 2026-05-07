import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { inngest } from '@/inngest/client';
import { uploadPdf } from '@/libs/actions/pdf';

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('pdf');
    if (file instanceof File && file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 15 MB.' },
        { status: 400 },
      );
    }
    const result = await uploadPdf(formData);

    const { ids } = await inngest.send({
      name: 'upload/extract.html',
      data: {
        pdfId: result.pdfId,
      },
    });

    // eslint-disable-next-line no-console
    console.log('[upload] inngest.send ids:', ids);
    const runID = ids[0];
    return NextResponse.json({ result, runID });
  } catch (err: any) {
    throw new Error (`PDF Extraction Failed ${err}`);
  }
}
