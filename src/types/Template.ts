export enum TemplateType {
  HTML_BUILDER = 'html-builder',
  HANDLBARS_TEMPLATE = 'handlebars-template',
}

export type Template = {
  templateId?: string;
  description: string;
  userId?: string;
  templateName?: string;
  templateContent: string;
  templateSampleData?: string;
  templateStyle?: string;
  assets?: string; // JSON string
  templateType?: string;
};

export type GeneratedTemplates = {
  templateId: string;
  dataValue?: JsonValue;
};

export type JsonValue<K extends string | number | symbol = string, V = any> =
  | string
  | number
  | boolean
  | null
  | JsonObject<K, V>
  | JsonArray<K, V>;

type JsonObject<K extends string | number | symbol = string, V = any> = {
  [key in K]?: V | JsonValue<K, V>;
};

type JsonArray<K extends string | number | symbol = string, V = any> = Array<JsonValue<K, V>>;
