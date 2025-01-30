import { type NextRequest, NextResponse } from 'next/server';
import PuppeteerHTMLPDF from 'puppeteer-html-pdf';

import { addGeneratedTemplateHistory, fetchTemplateById } from '@/libs/actions/templates';
import contentGenerator from '@/service/contentGenerator';
import type { TemplateType } from '@/types/Template';

import { authenticateApi } from '../../authenticateApi';
import { withApiAuth } from '../../withApiAuth';

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
    const dev_mode = searchParams.get('dev_mode') === 'true';

    // Parse the request body
    const body = await req.json();
    const { templateData } = body; // Extract dev_mode from body with default false

    // Fetch the template by ID
    const template = await fetchTemplateById(templateId, dev_mode);

    if (!template || template.error) {
      return NextResponse.json(
        { error: template?.error || 'Template not found' },
        { status: 404 },
      );
    }
    // Initialize PuppeteerHTMLPDF instance
    const htmlPdf = new PuppeteerHTMLPDF();
    htmlPdf.setOptions({
      format: 'A4',
      printBackground: true,
    });

    const content = await contentGenerator({
      templateType: template?.data?.templateType as TemplateType,
      templateContent: template?.data?.templateContent as string,
      templateStyle: template?.data?.templateStyle as string,
      templateData,
    });

    // Generate the PDF
    const pdfBuffer = await htmlPdf.create(content);

    await addGeneratedTemplateHistory({ templateId: template.data?.id as string, dataValue: templateData });

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
