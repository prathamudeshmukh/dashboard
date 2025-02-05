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

export type UsageMetric = {
  generatedDate: Date;
  templateName: string;
  email: string;
  data?: JsonObject;
};

export type UsageMetricRequest = {
  email: string;
  page: number;
  pageSize?: number;
  startDate?: Date;
  endDate?: Date;
};

export type PaginatedResponse = {
  data: UsageMetric[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
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

export type JsonObject<K extends string | number | symbol = string, V = any> = {
  [key in K]?: V | JsonValue<K, V>;
};

type JsonArray<K extends string | number | symbol = string, V = any> = Array<JsonValue<K, V>>;
