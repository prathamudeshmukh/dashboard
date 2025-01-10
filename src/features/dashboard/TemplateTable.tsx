'use client';

import React, { useEffect, useState } from 'react';

import { fetchTemplates } from '@/libs/actions/templates';

const TemplateTable = () => {
  const [templateData, setTempldateData] = useState<any>();
  useEffect(() => {
    const fetchTemplateData = async () => {
      const userId = 1; // Example user ID
      const response = await fetchTemplates({ userId });
      setTempldateData(response.data);
    };

    fetchTemplateData();
  }, []);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">ID</th>
            <th className="border border-gray-300 px-4 py-2">Description</th>
            <th className="w-1/3 border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {templateData?.map((template: any) => (
            <tr key={template.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">{template.id}</td>
              <td className="border border-gray-300 px-4 py-2">{template.description}</td>
              <td className="flex items-center justify-center border border-gray-300 px-4 py-2">
                <button className="mr-2 rounded bg-blue-500 px-4 py-1 text-white hover:bg-blue-600">
                  Edit
                </button>
                <button className="rounded bg-red-500 px-4 py-1 text-white hover:bg-red-600">
                  Delete
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
