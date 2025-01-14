import { users } from '@/models/Schema';
import type { User } from '@/types/User';

import { db } from '../DB';

export async function saveUser(user: User) {
  try {
    const { email, username } = user;

    // Validate required fields
    if (!username || !email) {
      throw new Error('Invalid data: username and email are required');
    }

    // Save the user to the database
    await db.insert(users).values({
      email,
      username,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error saving user:', error);
    return { success: false, error: error.message };
  }
}
