import { NextRequest, NextResponse } from 'next/server';

import * as authModule from '@/app/[locale]/api/authenticateApi';

import { POST } from '../route';

describe('POST /convert/:templateId', async () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns authentication error when authentication fails', async () => {
    const authErrorResponse = NextResponse.json(
      { error: 'Missing authentication credentials' },
      { status: 401 },
    );

    vi.spyOn(authModule, 'authenticateApi').mockResolvedValueOnce(authErrorResponse);

    const request = new NextRequest(
      'https://api.templify.cloud/convert/test-template-id',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'client_secret': 'test_client_secret',
          'client_id': 'test_client_id',
        },
      },
    );

    const response = await POST(request, {
      params: { templateId: 'test-template-id' },
    });

    expect(response.status).toBe(401);

    const json = await response.json();

    expect(json.error).toBe('Missing authentication credentials');
  });
});
