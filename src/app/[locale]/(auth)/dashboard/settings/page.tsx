import { auth } from '@clerk/nextjs/server';
import React from 'react';

import APIKeys from '@/features/dashboard/APIKeys';

const page = () => {
  const { userId } = auth();
  return (
    <APIKeys clientId={userId as string} />
  );
};

export default page;
