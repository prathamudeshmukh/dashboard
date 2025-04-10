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
      <CreateTemplateWizard />
    </>
  );
};

export default page;
