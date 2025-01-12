'use client';
import { useAuth, useSignUp } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function SignUpHandler() {
  const { signUp } = useSignUp();
  const { getToken } = useAuth(); // Get the session token

  useEffect(() => {
    const handleSignUp = async () => {
      if (signUp) {
        if (signUp.status === 'complete') {
          const newUser = {
            email: signUp.emailAddress as string,
            username: signUp.firstName as string,
          };

          try {
            const token = await getToken();
            // Save the new user to your database
            const response = await fetch('/api/user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(newUser),
            });

            if (!response.ok) {
              console.error('Failed to save user:', await response.text());
            }
          } catch (error) {
            console.error('Error saving user:', error);
          }
        }
      }
    };

    handleSignUp();
  }, [signUp]);

  return null;
};
