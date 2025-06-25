export type PostMessagePayload = {
  type: 'IFRAME_LOADED' | 'TEMPLATE_DATA_RESPONSE' | 'TEMPLATE_UPDATE';
  data?: any;
  source?: 'parent' | 'iframe';
};

export type TemplateData = {
  templateName: string;
  templateDescription: string;
  handlebarsCode: string;
  handlebarsJson: string;
  creationMethod: string;
};
