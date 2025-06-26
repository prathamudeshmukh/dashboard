export type PostMessagePayload = {
  type: 'IFRAME_LOADED' | 'TEMPLATE_DATA_RESPONSE' | 'TEMPLATE_UPDATE';
  data?: any;
  source?: 'parent' | 'iframe';
};

export type TemplateData = {
  handlebarsCode: string;
  handlebarsJson: string;
  htmlContent: string;
  htmlStyle: string;
};
