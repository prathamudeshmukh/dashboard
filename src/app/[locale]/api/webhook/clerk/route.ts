import type { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

import { creditUser, saveUser } from '@/libs/actions/user';

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Create a new Svix instance with your webhook secret
  const webhook = new Webhook(SIGNING_SECRET);

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let webhookEvent: WebhookEvent;

  // Verify the webhook
  try {
    webhookEvent = webhook.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error: Could not verify webhook:', err);
    return new Response('Error: Verification error', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = webhookEvent.type;

  if (eventType !== 'user.created') {
    return;
  }
  const { id, email_addresses, first_name } = webhookEvent.data;

  try {
    await saveUser({ clientId: id, email: email_addresses[0]?.email_address as string, username: first_name as string });
    // credit 150 for new user
    await creditUser(id, 150);
    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error saving user to database:', error);
    return NextResponse.json(
      { error: 'Error saving user to database' },
      { status: 500 },
    );
  }
}
