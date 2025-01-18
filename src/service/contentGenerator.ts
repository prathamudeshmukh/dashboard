import hbs from 'handlebars';

import type { JsonValue } from '@/types/Template';
import { TemplateType } from '@/types/Template';

import lintCSS from './lintCSS';
import lintHTML from './lintHTML';

type TemplateParams = {
  templateType: TemplateType;
  templateContent: string;
  templateStyle?: string;
  templateData?: JsonValue;
};

const contentGenerator = async ({
  templateType,
  templateContent,
  templateStyle = '',
  templateData = {},
}: TemplateParams): Promise<string> => {
  // Lint HTML content
  const htmlErrors = lintHTML(templateContent);
  if (htmlErrors?.length > 0) {
    throw new Error(`HTML validation failed: ${htmlErrors.join(', ')}`);
  }

  // Lint CSS content
  const cssErrors = await lintCSS(templateStyle);
  if (cssErrors?.length > 0) {
    throw new Error(`CSS validation failed: ${cssErrors.join(', ')}`);
  }

  // Compile and generate content for Handlebars templates
  if (templateType === TemplateType.HANDLBARS_TEMPLATE) {
    try {
      const compiledTemplate = hbs.compile(templateContent);
      return compiledTemplate(templateData);
    } catch (error: any) {
      console.error('Error compiling or rendering Handlebars template:', error.message);
      throw new Error(`Failed to generate content from Handlebars template: ${error.message}`);
    }
  }

  // For regular HTML templates
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${templateStyle}</style>
    </head>
    <body>
      ${templateContent}
    </body>
    </html>
  `;
};

export default contentGenerator;
