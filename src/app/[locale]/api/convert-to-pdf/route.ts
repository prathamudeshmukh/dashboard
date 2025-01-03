import { parseDocument } from 'htmlparser2';
import { type NextRequest, NextResponse } from 'next/server';
import PuppeteerHTMLPDF from 'puppeteer-html-pdf';

type PDFRequest = {
  htmlContent: string;
};

function validateHTML(html: string): boolean {
  try {
    const document = parseDocument(html);
    return !!document; // Returns true if the HTML is valid, false otherwise
  } catch {
    return false; // Catch any unexpected errors in parsing
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: PDFRequest = await req.json();

    if (!body.htmlContent || typeof body.htmlContent !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. "html" is required and must be a string.' },
        { status: 400 },
      );
    }

    // Validate the HTML
    if (!validateHTML(body.htmlContent)) {
      return NextResponse.json(
        { error: 'Invalid HTML. Please provide well-formed HTML content.' },
        { status: 400 },
      );
    }

    const { htmlContent } = body;

    const htmlPdf = new PuppeteerHTMLPDF();
    htmlPdf.setOptions({
      format: 'A4',
      printBackground: true,
    });

    const pdfBuffer = await htmlPdf.create(htmlContent);

    // Convert the PDF buffer to a Base64 string
    const pdfBase64 = pdfBuffer.toString('base64');

    return NextResponse.json({ pdfBase64 });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 },
    );
  }
}
