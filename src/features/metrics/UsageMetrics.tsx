'use client';

import { endOfDay, startOfDay } from 'date-fns';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

import PaginationControls from '@/components/PaginationControls';
import { Button } from '@/components/ui/button';
import { TextArea } from '@/components/ui/text-area';
import { fetchUsageMetrics } from '@/libs/actions/templates';
import type { UsageMetric } from '@/types/Template';

const UsageMetrics = ({ email }: { email: string }) => {
  const t = useTranslations('UsageMetrics');
  const [metrics, setMetrics] = useState<UsageMetric[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    const loadMetrics = async () => {
      if (!email) {
        return;
      }

      const data = await fetchUsageMetrics({
        email,
        page,
        startDate: startDate ? startOfDay(new Date(startDate)) : undefined,
        endDate: endDate ? endOfDay(new Date(endDate)) : undefined,
      });
      setMetrics(data.data);
      setTotalPages(data.totalPages);
    };

    loadMetrics();
  }, [email, page, startDate, endDate]);

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

  const handleDateFilterReset = () => {
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="overflow-x-auto">
      <h2 className="mb-4 text-2xl font-bold">
        {t('title')}
        {' '}
        {email}
      </h2>

      <div className="mb-4 flex items-center gap-4">
        <div>
          <label htmlFor="startDateLabel" className="block text-sm font-medium">Start Date: </label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label htmlFor="endDateLabel" className="block text-sm font-medium">End Date: </label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full rounded border p-2"
          />
        </div>

        <Button
          onClick={handleDateFilterReset}
          className="self-end rounded bg-gray-500 px-4 py-2 text-white"
        >
          Reset Filters
        </Button>
      </div>

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
                    <th className="border border-gray-300 p-2 px-4">{t('template_name')}</th>
                    <th className="border border-gray-300 p-2 px-4">{t('user')}</th>
                    <th className="border border-gray-300 p-2 px-4">{t('input_data')}</th>
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
              <PaginationControls
                page={page}
                totalPages={totalPages}
                onNext={handleNextPage}
                onPrevious={handlePreviousPage}
              />
            </>
          )}
    </div>
  );
};

export default UsageMetrics;
