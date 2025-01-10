export type SaveTemplate = {
  description: string;
  userId: number;
  templateContent: string;
  templateSampleData: string;
  templateStyle: string;
  assets: string;
};

export type FetchTemplates = {
  userId: number;
};
