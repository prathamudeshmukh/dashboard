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

    const response = await generatePdf({
      devMode,
      templateId,
      templateData,
      isApi: true,
    });

    if (response.error) {
      return NextResponse.json({ error: response.error }, { status: 400 });
    }

    // Return the binary PDF file in the response
    return new NextResponse(response.pdf, {
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
