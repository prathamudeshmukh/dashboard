import { eq } from 'drizzle-orm';

import { apikeys, users } from '@/models/Schema';
import type { User } from '@/types/User';

import { db } from '../DB';

export async function saveUser(user: User) {
  try {
    const { email, username, clientId } = user;

    // Validate required fields
    if (!username || !email) {
      throw new Error('Invalid data: username and email are required');
    }

    // Save the user to the database
    await db.insert(users).values({
      email,
      username,
      clientId,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error saving user:', error);
    return { success: false, error: error.message };
  }
}

export async function getClientById(clientId: string) {
  try {
    if (!clientId) {
      throw new Error ('Please provide clientId');
    };

    const client = await db.select().from(apikeys).where(eq(apikeys.clientId, clientId));

    return { success: true, data: client[0] };
  } catch (error: any) {
    console.error('Error saving user:', error);
    return { success: false, error: error.message };
  }
}
