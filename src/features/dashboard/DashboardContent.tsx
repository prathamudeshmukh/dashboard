import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';

import TemplateTable from './TemplateTable';

export const DashboardContent = () => (
  <div className="flex h-[600px] flex-col rounded-md bg-card p-5">
    <div className="mt-3 text-center">
      <div className="text-xl font-semibold">Let's get started</div>
    </div>
    <div className="mt-5 flex items-end justify-end">
      <Link href="/dashboard/template-dashboard">
        <Button>Create New Template</Button>
      </Link>
    </div>
    <div className="mt-5"><TemplateTable /></div>
  </div>
);
