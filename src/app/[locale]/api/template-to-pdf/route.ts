import hbs from 'handlebars';
import { type NextRequest, NextResponse } from 'next/server';
import PuppeteerHTMLPDF from 'puppeteer-html-pdf';

import { fetchTemplateById } from '@/libs/actions/templates';
import { type JsonValue, TemplateType } from '@/types/Template';

type PDFRequest = {
  templateId: string;
  templateData: JsonValue;
};

export async function POST(req: NextRequest) {
  try {
    const body: PDFRequest = await req.json();

    const { templateId, templateData } = body;

    const template = await fetchTemplateById(templateId);

    if (template.error) {
      return NextResponse.json(
        { error: template.error },
        { status: 500 },
      );
    }

    const htmlPdf = new PuppeteerHTMLPDF();
    htmlPdf.setOptions({
      format: 'A4',
      printBackground: true,
    });

    let content;

    if (template.data?.templateType === TemplateType.HANDLBARS_TEMPLATE) { // if the template is of handlebars
      const templateContent = hbs.compile(template.data.templateContent);
      const data = templateData || {};
      content = templateContent(data);
    } else { // if the template is of regular html template
      content = `<style>${template.data?.templateStyle}</style>
      ${template.data?.templateContent}`
      ;
    }

    const pdfBuffer = await htmlPdf.create(content as string);

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
