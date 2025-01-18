import { type NextRequest, NextResponse } from 'next/server';
import PuppeteerHTMLPDF from 'puppeteer-html-pdf';

import { fetchTemplateById } from '@/libs/actions/templates';
import contentGenerator from '@/service/contentGenerator';
import type { JsonValue, TemplateType } from '@/types/Template';

type PDFRequest = {
  templateId: string;
  templateData: JsonValue;
};

export async function POST(req: NextRequest) {
  try {
    // Extract search parameters from the URL
    const searchParams = req.nextUrl.searchParams;
    const templateId = searchParams.get('templateId');

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is missing in the query parameters' },
        { status: 400 },
      );
    }

    // Parse the request body for additional data
    const body: PDFRequest = await req.json();
    const { templateData } = body;

    // Fetch the template by ID
    const template = await fetchTemplateById(templateId);

    if (template.error) {
      return NextResponse.json(
        { error: template.error },
        { status: 500 },
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

    // Return the binary PDF file in the response
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="document.pdf"',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: `Failed to generate PDF ${error}` },
      { status: 500 },
    );
  }
}
