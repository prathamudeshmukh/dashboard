import { useAuth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { saveUser } from '@/libs/actions/user';
import type { User } from '@/types/User';

export async function POST(req: Request) {
  const body = await req.json();
  const { userId } = useAuth();

  if (!userId) {
    return;
  }

  // Extract user data from the payload
  const user = body.data;

  // Validate input data
  if (!user || !user.email_addresses || !user.email_addresses[0]?.email_address || !user.first_name) {
    return NextResponse.json(
      { success: false, error: 'Invalid input data' },
      { status: 400 },
    );
  }

  const newUser: User = {
    email: user.email_addresses[0]?.email_address,
    username: user.first_name,
    clientId: userId,
  };

  try {
    // Save user data to your database
    await saveUser(newUser);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
