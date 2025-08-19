import type { JsonObject } from '@/types/Template';

export function wrapJson(originalJson: JsonObject) {
  return {
    SampleJSON: {
      Records: originalJson,
    },
  };
}
