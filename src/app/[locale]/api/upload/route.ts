import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { type NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { inngest } from '@/inngest/client';

export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    let runID: string = '';
    const result = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async () => {
        const uuid = uuidv4();
        const blobPath = `uploads/${uuid}/input/in.pdf`;

        return {
          allowedContentTypes: ['application/pdf'],
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({ pdfId: uuid }),
          pathname: blobPath,
        };
      },

      onUploadCompleted: async ({ tokenPayload }) => {
        const { pdfId } = JSON.parse(tokenPayload!);

        const { ids } = await inngest.send({
          name: 'upload/extract.html',
          data: {
            pdfId,
          },
        });

        runID = ids[0]!;
      },
    });
    return NextResponse.json({ result, runID });
  } catch (err: any) {
    throw new Error (`PDF Extraction Failed ${err}`);
  }
}
