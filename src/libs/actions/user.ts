'use server';

import { eq } from 'drizzle-orm';

import { apikeys, users } from '@/models/Schema';
import { decrypt } from '@/service/crypto';
import { generateApiKeys } from '@/service/generateApiKeys';
import type { ClientConfigs, User } from '@/types/User';

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
      throw new Error(`Client with ID ${clientId} not found`);
    }

    return client as ClientConfigs;
  } catch (error: any) {
    throw new Error(`Error fetching client: ${error.message}`);
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
