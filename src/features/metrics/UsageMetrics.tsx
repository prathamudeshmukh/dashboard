'use client';

import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

import { TextArea } from '@/components/ui/text-area';
import { fetchUsageMetrics } from '@/libs/actions/templates';
import type { UsageMetric } from '@/types/Template';

const UsageMetrics = ({ email }: { email: string }) => {
  const t = useTranslations('UsageMetrics');
  const [metrics, setMetrics] = useState<UsageMetric[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const loadMetrics = async () => {
      if (!email) {
        return;
      }

      const data = await fetchUsageMetrics(email, page);
      setMetrics(data.data);
      setTotalPages(data.totalPages);
    };

    loadMetrics();
  }, [email, page]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(prevPage => prevPage - 1);
    }
  };

  return (
    <div className="overflow-x-auto">
      <h2 className="mb-4 text-2xl font-bold">
        {t('title')}
        {' '}
        {email}
      </h2>
      {metrics.length === 0
        ? (
            <p>{t('table_fallback')}</p>
          )
        : (
            <>
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 p-2 px-4">{t('date_time')}</th>
                    <th className="border border-gray-300 p-2 px-4">{t('templateName')}</th>
                    <th className="border border-gray-300 p-2 px-4">{t('user')}</th>
                    <th className="border border-gray-300 p-2 px-4">{t('data')}</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric, index) => (

                    <tr key={index} className="hover:bg-gray-100">
                      <td className="border border-gray-300 p-2 px-4">
                        {metric.generatedDate.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 p-2 px-4">{metric.templateName}</td>
                      <td className="border border-gray-300 p-2 px-4">{metric.email}</td>
                      <td className="border border-gray-300 p-2 px-4">
                        <TextArea className="h-24" value={JSON.stringify(metric.data, null, 2)} />

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="mt-4 flex justify-between">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className={`rounded px-4 py-2 ${page === 1 ? 'cursor-not-allowed bg-gray-300' : 'bg-blue-500 text-white'
                  }`}
                >
                  Previous
                </button>
                <span className="text-lg">
                  Page
                  {page}
                  {' '}
                  of
                  {totalPages}
                </span>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className={`rounded px-4 py-2 ${page === totalPages ? 'cursor-not-allowed bg-gray-300' : 'bg-blue-500 text-white'
                  }`}
                >
                  Next
                </button>
              </div>
            </>
          )}
    </div>
  );
};

export default UsageMetrics;
