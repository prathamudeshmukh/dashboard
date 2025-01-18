'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

import { deleteTemplate, fetchTemplates } from '@/libs/actions/templates';
import { TemplateType } from '@/types/Template';

const TemplateTable = () => {
  const [templateData, setTempldateData] = useState<any>();
  const router = useRouter();

  const t = useTranslations('TemplateTable');

  const fetchTemplateData = async () => {
    const userId = 'c9ded72d-4cae-4fab-b86c-a084ec7f2ecc'; // Example user ID
    const response = await fetchTemplates(userId);
    setTempldateData(response.data);
  };

  useEffect(() => {
    fetchTemplateData();
  }, []);

  const handleEdit = (templateId: string, templateType: string) => {
    if (templateType === TemplateType.HTML_BUILDER) {
      router.push(`/dashboard/html-builder?templateId=${templateId}`);
    } else {
      router.push(`/dashboard/handlebar-editor?templateId=${templateId}`);
    }
  };

  const handleDelete = async (templateId: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this template?'); // eslint-disable-line no-alert
    if (!confirmDelete) {
      return;
    }

    const response = await deleteTemplate(templateId);

    if (response.success) {
      alert(response.message); // eslint-disable-line no-alert
      fetchTemplateData();
    } else {
      alert(`Failed to delete template: ${response.error}`); // eslint-disable-line no-alert
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">{t('id')}</th>
            <th className="border border-gray-300 px-4 py-2">{t('template_name')}</th>
            <th className="border border-gray-300 px-4 py-2">{t('description')}</th>
            <th className="border border-gray-300 px-4 py-2">{t('type')}</th>
            <th className="w-1/3 border border-gray-300 px-4 py-2">{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {templateData?.map((template: any) => (
            <tr key={template.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">{template.id}</td>
              <td className="border border-gray-300 px-4 py-2">{template.templateName}</td>
              <td className="border border-gray-300 px-4 py-2">{template.description}</td>
              <td className="border border-gray-300 px-4 py-2">{template.templateType}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button onClick={() => handleEdit(template.id, template.templateType)} className="mr-2 rounded bg-blue-500 px-4 py-1 text-white hover:bg-blue-600">
                  {t('edit')}
                </button>
                <button onClick={() => handleDelete(template.id)} className="rounded bg-red-500 px-4 py-1 text-white hover:bg-red-600">
                  {t('delete')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TemplateTable;
