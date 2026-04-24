import React from 'react';

import CreateTemplateWizard from '@/components/template/CreateTemplateWizard';

const page = () => {
  return (
    <div className="flex flex-col rounded-2xl bg-card p-2 shadow-2xl">
      <CreateTemplateWizard />
    </div>
  );
};

export default page;
