import hbs from 'handlebars';

import type { JsonValue } from '@/types/Template';
import { TemplateType } from '@/types/Template';

type TemplateParams = {
  templateType: TemplateType;
  templateContent: string;
  templateStyle?: string;
  templateData?: JsonValue;
};

const generateTemplateContent = ({
  templateType,
  templateContent,
  templateStyle = '',
  templateData = {},
}: TemplateParams): string => {
  if (templateType === TemplateType.HANDLBARS_TEMPLATE) {
    const compiledTemplate = hbs.compile(templateContent);
    return compiledTemplate(templateData);
  }

  // For regular HTML templates
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Generated PDF</title>
      <style>${templateStyle}</style>
    </head>
    <body>
      ${templateContent}
    </body>
    </html>
  `;
};

export default generateTemplateContent;
