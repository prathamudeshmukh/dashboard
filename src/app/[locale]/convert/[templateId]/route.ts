import { Buffer } from 'node:buffer';

import { type NextRequest, NextResponse } from 'next/server';

import { generatePdf } from '@/libs/actions/templates';

import { authenticateApi } from '../../api/authenticateApi';
import { withApiAuth } from '../../api/withApiAuth';

export const POST = withApiAuth(async (req: NextRequest, { params }: { params: { templateId: string } }): Promise<NextResponse> => {
  try {
    const authResult = await authenticateApi(req);
    if (authResult instanceof NextResponse) {
      return authResult; // Authentication failed
    }

    const { templateId } = params;

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is missing in the path' },
        { status: 400 },
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const devMode = searchParams.get('devMode') === 'true';

    // Parse the request body
    const body = await req.json();
    const { templateData } = body; // Extract dev_mode from body with default false

    const response = await generatePdf({
      devMode,
      templateId,
      templateData,
      isApi: true,
    });

    if (response.error) {
      return NextResponse.json({ error: response.error }, { status: 400 });
    }

    const pdfBuffer = Buffer.from(response.pdf as string, 'base64');

    // Return the binary PDF file in the response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="document.pdf"',
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: `Failed to generate PDF: ${error.message}` },
      { status: 500 },
    );
  }
});
