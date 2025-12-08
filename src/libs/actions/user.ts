'use server';

import { eq, sql } from 'drizzle-orm';

import { generateWebhookSecret } from '@/service/generateWebhook';

import { apikeys, creditTransactions, users, webhook_endpoints } from '../../models/Schema';
import { decrypt, encrypt } from '../../service/crypto';
import { generateApiKeys } from '../../service/generateApiKeys';
import type { ClientConfigs, User } from '../../types/User';
import { db } from '../DB';

export async function saveUser(user: User) {
  try {
    const { email, username, clientId } = user;

    // Validate required fields
    if (!username || !email) {
      throw new Error('Invalid data: username and email are required');
    }

    await db.transaction(async (tx) => {
      // First insert: save user
      await tx.insert(users).values({
        email,
        username,
        clientId,
      });

      // Generate API key
      const key = generateApiKeys();

      // Second insert: save API key
      await tx.insert(apikeys).values({
        clientId,
        clientSecret: key,
      });
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error saving user:', error);
    return { success: false, error: error.message };
  }
}

export async function creditUser(clientId: string, credit: number) {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(creditTransactions).values({
        clientId,
        credits: credit,
        paymentId: null,
      });

      // Update user's remaining balance
      await tx
        .update(users)
        .set({ remainingBalance: sql`${users.remainingBalance} + ${credit}` })
        .where(eq(users.clientId, clientId));
    });
  } catch (error) {
    console.error('Error crediting new user:', error);
    throw new Error('Failed to credit user.');
  }
}

export async function deductCredit(clientId: string) {
  try {
    // Fetch user's current balance
    const user = await db
      .select({ remainingBalance: users.remainingBalance })
      .from(users)
      .where(eq(users.clientId, clientId))
      .limit(1);

    if (!user.length || (user[0]?.remainingBalance as number) <= 0) {
      throw new Error ('Insufficient credits.');
    }

    // Deduct 1 credit
    await db
      .update(users)
      .set({ remainingBalance: user[0]?.remainingBalance as number - 1 })
      .where(eq(users.clientId, clientId));
  } catch (error) {
    console.error('Error deducting credit:', error);
    throw new Error (`Failed to deduct credit : ${error}`);
  }
}

export async function getClientById(clientId: string): Promise<ClientConfigs> {
  try {
    if (!clientId) {
      throw new Error('Please provide clientId');
    };

    const client = await db
      .query.apikeys.findFirst({
        where: eq(apikeys.clientId, clientId),
      });

    if (!client) {
      throw new Error(`Invalid client_id`);
    }

    return client as ClientConfigs;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getClientSecret(clientId: string): Promise<ClientConfigs> {
  try {
    if (!clientId) {
      throw new Error('Please provide clientId');
    }

    const client = await getClientById(clientId);

    if (!client || !client.clientSecret) {
      throw new Error(`API Key with ID ${clientId} not found`);
    }

    const decryptedSecret = decrypt(client.clientSecret);

    return {
      clientId: client.clientId,
      clientSecret: decryptedSecret,
    };
  } catch (error: any) {
    throw new Error(`Error fetching client secret: ${error.message}`);
  }
}

export async function saveWebhookEndpoint({
  clientId,
  url,
  encryptedSecret,
}: {
  clientId: string;
  url: string;
  encryptedSecret: string;
}) {
  try {
    const existing = await db.query.webhook_endpoints.findFirst({
      where: eq(webhook_endpoints.clientId, clientId),
    });

    if (existing) {
      await db
        .update(webhook_endpoints)
        .set({
          url,
          encryptedSecret,
          active: true,
        })
        .where(eq(webhook_endpoints.clientId, clientId));
    } else {
      await db.insert(webhook_endpoints).values({
        clientId,
        url,
        encryptedSecret,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('[Webhook Save Error]', error);
    throw new Error ('Failed to save webhook configuration');
  }
}

export async function getOrCreateWebhookEndpoint(clientId: string) {
  if (!clientId) {
    throw new Error('Missing clientId');
  }

  // Check for existing webhook endpoint
  const existing = await db.query.webhook_endpoints.findFirst({
    where: eq(webhook_endpoints.clientId, clientId),
  });

  // ✅ If webhook exists, decrypt and return it
  if (existing?.encryptedSecret) {
    const decryptedSecret = decrypt(existing.encryptedSecret);
    return { success: true, secret: decryptedSecret, url: existing.url, exists: true, created: false };
  }

  // ✅ Otherwise, generate a new secret (do not save)
  const newSecret = generateWebhookSecret();
  const encryptedSecret = encrypt(newSecret);

  return {
    success: true,
    secret: newSecret,
    url: '',
    encryptedSecret, // so client can later call `saveWebhookEndpoint`
    exists: false,
    created: true,
  };
}

export async function regenerateWebhookSecret() {
  const newSecret = generateWebhookSecret();
  const encryptedSecret = encrypt(newSecret);
  return { created: true, secret: newSecret, encryptedSecret };
}
