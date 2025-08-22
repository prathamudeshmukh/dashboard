import type { JsonValue } from '../Template';

export type GeneratePdfCoreRequest = {
  templateContent: string;
  templateStyle: string;
  templateData: JsonValue;
};

export type GeneratePdfCoreResult = {
  pdf: ArrayBuffer;
};

export type GeneratePdfWorkerRequest = {
  templateContent: string;
  templateStyle: string;
  templateData: JsonValue;
};
