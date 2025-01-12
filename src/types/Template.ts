export enum TemplateType {
  HTML_BUILDER = 'html-builder',
  HANDLBARS_TEMPLATE = 'handlebars-template',
}

export type Template = {
  description: string;
  userId: string;
  templateContent: string;
  templateSampleData: string;
  templateStyle: string;
  assets: string;
  templateType: TemplateType;
};

export type UpdateTemplateInput = {
  templateId: string;
  description?: string;
  templateContent: string;
  templateStyle: string;
  templateSampleData: string;
};
