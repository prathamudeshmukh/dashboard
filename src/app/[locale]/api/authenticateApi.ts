import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getClientById } from '@/libs/actions/user';
import { decrypt } from '@/service/crypto';

export async function authenticateApi(req: NextRequest): Promise<true | NextResponse> {
  // Extract `client_id` and `client_secret` from the headers
  const clientId = req.headers.get('client_id');
  const clientSecret = req.headers.get('client_secret');

  // Check if both headers are present
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Missing authentication credentials' },
      { status: 401 },
    );
  }

  // Retrieve client details from the database by clientId
  const client = await getClientById(clientId);

  // If no record is found, return 401
  if (!client) {
    return NextResponse.json(
      { error: 'Invalid client_id' },
      { status: 401 },
    );
  }

  // Decrypt the stored secret and compare
  const decryptedSecret = decrypt(client?.clientSecret as string);

  // If the secret is invalid, return 401
  if (clientSecret !== decryptedSecret) {
    return NextResponse.json(
      { error: 'Invalid client_secret' },
      { status: 401 },
    );
  }

  // Authentication is successful
  return true;
}
