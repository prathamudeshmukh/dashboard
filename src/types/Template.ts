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
  previewURL?: string;
  templateType?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FetchTemplateResponse = {
  templateName: string;
  templateId: string | null;
  description?: string;
  templateType: string;
};

export type FetchTemplatesRequest = {
  email: string;
  page: number;
  pageSize: number;
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
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

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type GeneratePdfRequest = {
  templateId?: string;
  templateData?: JsonObject;
  devMode?: boolean;
  isApi?: boolean;
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

export type TemplateGalleryProps = {
  color: string | null;
  id: string;
  style: string | null;
  htmlContent: string;
  title: string;
  icon: string | null;
  description: string | null;
  category: string | null;
  handlebarContent: string | null;
  sampleData: unknown;
};

export type TemplateSuccessData = {
  templateId: string;
  templateName: string;
  templateSampleData?: JsonValue;
};

export type SuccessViewProps = {
  templateId: string;
  templateName: string;
  templateSampleData?: string;
  onViewDashboard: () => void;
  onCreateAnother: () => void;
};

export type TemplatePreviewJobData = {
  templateId: string;
  templateType: string;
  templateContent: string;
  templateStyle?: string;
  templateSampleData?: any;
};

export type UpdatePreviewURLParams = {
  templateId: string;
  previewURL: string;
  environment?: string;
};

export type UpdatePreviewURLResult = {
  data?: {
    templateId: string;
    previewURL: string;
  };
  error?: string;
};
