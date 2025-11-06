import { auth } from '@clerk/nextjs/server';
import React from 'react';

import APIKeys from '@/features/dashboard/settings/APIKeys';
import WebhooksPage from '@/features/dashboard/settings/Webhooks';

const page = () => {
  const { userId } = auth();
  return (
    <div className="space-y-12">
      <APIKeys clientId={userId as string} />
      <WebhooksPage />
    </div>
  );
};

export default page;
