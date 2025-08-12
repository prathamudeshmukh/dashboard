export type PostMessagePayload = {
  type: 'IFRAME_LOADED' | 'TEMPLATE_DATA_RESPONSE' | 'TEMPLATE_UPDATE' | 'TEMPLATE_ID_RESPONSE';
  data?: any;
  source?: 'parent' | 'iframe';
};

export type TemplateData = {
  handlebarsCode: string;
  handlebarTemplateJson: string;
};
