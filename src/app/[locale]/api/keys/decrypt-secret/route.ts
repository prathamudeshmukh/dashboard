import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getClientById } from '@/libs/actions/user';
import { decrypt } from '@/service/crypto';

export async function POST(
  req: NextRequest,
): Promise< NextResponse > {
  try {
    const body = await req.json();
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const client = await getClientById(clientId);

    if (!client || !client.clientSecret) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    // Decrypt and return the client secret
    const decryptedSecret = decrypt(client?.clientSecret);

    return NextResponse.json(
      {
        data: {
          clientId: client.clientId,
          clientSecret: decryptedSecret,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to retrieve client secret : ${error}` },
      { status: 500 },
    );
  }
}
