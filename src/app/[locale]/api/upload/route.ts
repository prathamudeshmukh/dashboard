import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { uploadPdf } from '@/libs/actions/pdf';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await uploadPdf(formData);

    return NextResponse.json(result);
  } catch (err: any) {
    throw new Error (`Something went wrong ${err}`);
  }
}
