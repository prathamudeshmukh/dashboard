import { currentUser } from '@clerk/nextjs/server';
import React from 'react';

import UsageMetrics from '@/features/metrics/UsageMetrics';

const page = async () => {
  const user = await currentUser();
  return (
    <div>
      <UsageMetrics email={user?.emailAddresses[0]?.emailAddress as string} />
    </div>
  );
};

export default page;
