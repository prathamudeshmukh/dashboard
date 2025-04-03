import React from 'react';

import TemplateTable from './TemplateTable';

export const DashboardContent = () => {
  return (
    <div className="flex  flex-col rounded-2xl bg-card p-5 shadow-2xl">
      <div className="mt-5"><TemplateTable /></div>
    </div>
  );
};
