import hbs from 'handlebars';

import type { JsonValue } from '@/types/Template';

import lintHTML from './lintHTML';

type TemplateParams = {
  templateContent: string;
  templateStyle?: string;
  templateData?: JsonValue;
};

const contentGenerator = async ({
  templateContent,
  templateStyle = '',
  templateData = {},
}: TemplateParams): Promise<string> => {
  // Lint HTML content
  const htmlErrors = lintHTML(templateContent);
  if (htmlErrors?.length > 0) {
    throw new Error(`HTML validation failed: ${htmlErrors.join(', ')}`);
  }
  try {
    const compiledTemplate = hbs.compile(templateContent);
    const renderedBody = compiledTemplate(templateData);

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${templateStyle}</style>
      </head>
      <body>
        ${renderedBody}
      </body>
      </html>
    `;
  } catch (error: any) {
    console.error('Error compiling or rendering Handlebars template:', error.message);
    throw new Error(`Failed to generate content from Handlebars template: ${error.message}`);
  }
};

export default contentGenerator;
