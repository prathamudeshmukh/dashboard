import { NextRequest } from 'next/server';
import { getResponse } from 'tests/apitest/helper';

describe('POST /convert/:templateId', async () => {
  // beforeAll(() => {
  //   // eslint-disable-next-line no-console
  //   console.log('TEST DATABASE_URL:', process.env.DATABASE_URL);
  // });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns authentication error when client_id is missing in header', async () => {
    const request = new NextRequest(
      'https://api.templify.cloud/convert/test-template-id',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'client_secret': 'test-client-secret',
        },
      },
    );

    const { response } = await getResponse(request, 'test-template-id');

    expect(response.status).toBe(401);

    const json = await response.json();

    expect(json.error).toBe('Missing authentication credentials');
  });

  it('returns authentication error when client_secret is missing in header', async () => {
    const request = new NextRequest(
      'https://api.templify.cloud/convert/test-template-id',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'client_id': 'test-client-id',
        },
      },
    );

    const { response } = await getResponse(request, 'test-template-id');

    expect(response.status).toBe(401);

    const json = await response.json();

    expect(json.error).toBe('Missing authentication credentials');
  });

  it('returns authentication error when client_id is invalid', async () => {
    const request = new NextRequest(
      'https://api.templify.cloud/convert/test-template-id',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'client_secret': 'test-client-secret',
          'client_id': 'user_id_123',
        },
      },
    );

    const { response } = await getResponse(request, 'test-template-id');

    expect(response.status).toBe(401);

    const json = await response.json();

    expect(json.error).toBe('Invalid client_id');
  });

  it('returns authentication error when client_secret is invalid', async () => {
    const request = new NextRequest(
      'https://api.templify.cloud/convert/test-template-id',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'client_secret': 'test-client-secret',
          'client_id': 'user_id_123',
        },
      },
    );

    const { response } = await getResponse(request, 'test-template-id');

    expect(response.status).toBe(401);

    const json = await response.json();

    expect(json.error).toBe('Invalid client_secret');
  });
});
