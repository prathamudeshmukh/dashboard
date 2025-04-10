import React from 'react';

import CreateTemplateWizard from '@/components/template/CreateTemplateWizard';
import { TitleBar } from '@/features/dashboard/TitleBar';

const page = () => {
  return (
    <>
      <TitleBar
        title="Create New Template"
        description="Follow the steps to create your template"
      />
      <div className="flex flex-col rounded-2xl bg-card p-5 shadow-2xl">
        <CreateTemplateWizard />
      </div>
    </>
  );
};

export default page;
