import type { OpenAPIV3 } from 'openapi-types';
import { describe, expect, it } from 'vitest';

import { spec } from './spec';

const EXPECTED_PATH = '/convert/{templateId}';
const EXPECTED_STATUS_CODES = ['200', '202', '400', '401', '402', '404', '429', '500'];

describe('OpenAPI spec structural invariants', () => {
  it('has the correct path defined', () => {
    expect(spec.paths).toHaveProperty(EXPECTED_PATH);
  });

  it('path has a POST operation', () => {
    const path = spec.paths[EXPECTED_PATH];

    expect(path).toHaveProperty('post');
  });

  it('POST operation requires client_id and client_secret security', () => {
    const operation = spec.paths[EXPECTED_PATH]?.post as OpenAPIV3.OperationObject;

    expect(operation.security).toEqual([{ client_id: [], client_secret: [] }]);
  });

  it('200 response has content-type application/pdf', () => {
    const operation = spec.paths[EXPECTED_PATH]?.post as OpenAPIV3.OperationObject;
    const response = operation.responses['200'] as OpenAPIV3.ResponseObject;

    expect(response.content).toHaveProperty('application/pdf');
  });

  it('200 response schema uses binary format', () => {
    const operation = spec.paths[EXPECTED_PATH]?.post as OpenAPIV3.OperationObject;
    const response = operation.responses['200'] as OpenAPIV3.ResponseObject;
    const schema = response.content?.['application/pdf']?.schema as OpenAPIV3.SchemaObject;

    expect(schema.format).toBe('binary');
  });

  it('202 response JSON schema has template_id, status, and job_id', () => {
    const asyncSchema = (spec.components?.schemas?.AsyncResponse) as OpenAPIV3.SchemaObject;

    expect(asyncSchema.properties).toHaveProperty('template_id');
    expect(asyncSchema.properties).toHaveProperty('status');
    expect(asyncSchema.properties).toHaveProperty('job_id');
  });

  it('all required status codes are documented', () => {
    const operation = spec.paths[EXPECTED_PATH]?.post as OpenAPIV3.OperationObject;
    for (const code of EXPECTED_STATUS_CODES) {
      expect(operation.responses).toHaveProperty(code);
    }
  });

  it('has no dangling $ref references', () => {
    const specString = JSON.stringify(spec);
    const refs = [...specString.matchAll(/"\$ref":"([^"]+)"/g)].flatMap(m => m[1] ? [m[1]] : []);

    for (const ref of refs) {
      if (!ref.startsWith('#/')) {
        continue;
      }

      const parts = ref.replace('#/', '').split('/');

      let node: any = spec;
      for (const part of parts) {
        expect(node, `$ref "${ref}" references undefined path segment "${part}"`).toHaveProperty(part);

        node = node[part];
      }
    }
  });

  it('security schemes define client_id and client_secret', () => {
    expect(spec.components?.securitySchemes).toHaveProperty('client_id');
    expect(spec.components?.securitySchemes).toHaveProperty('client_secret');
  });

  it('server URL is the production base URL', () => {
    expect(spec.servers?.[0]?.url).toBe('https://api.templify.cloud');
  });
});
