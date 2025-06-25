export type PostMessagePayload = {
  type: 'IFRAME_LOADED' | 'TEMPLATE_DATA_RESPONSE' | 'TEMPLATE_UPDATE';
  data?: any;
  source?: 'parent' | 'iframe';
};

export type HandlebarTemplateData = {
  handlebarsCode: string;
  handlebarsJson: string;
};
