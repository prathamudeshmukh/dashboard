'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { endOfDay, startOfDay } from 'date-fns';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';

import { DatePickerWithRange } from '@/components/DatePickerWithRange';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { fetchUsageMetrics } from '@/libs/actions/templates';
import type { JsonObject, UsageMetric } from '@/types/Template';

const UsageMetrics = ({ email }: { email: string }) => {
  const t = useTranslations('UsageMetrics');
  const [metrics, setMetrics] = useState<UsageMetric[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    const loadMetrics = async () => {
      if (!email) {
        return;
      }

      const data = await fetchUsageMetrics({
        email,
        page,
        pageSize: 10,
        startDate: dateRange?.from ? startOfDay(dateRange.from) : undefined,
        endDate: dateRange?.to ? endOfDay(dateRange.to) : undefined,
      });
      setMetrics(data.data);
      setTotalPages(data.totalPages);
    };

    loadMetrics();
  }, [email, page, dateRange]);

  const handleDateFilterReset = () => {
    setDateRange({ from: undefined, to: undefined });
    setPage(1);
  };

  const columns: ColumnDef<UsageMetric>[] = [
    {
      accessorKey: 'generatedDate',
      header: () => t('date_time'),
      cell: (info) => {
        const date: Date = info.getValue() as Date;
        return date.toLocaleString();
      },
    },
    {
      accessorKey: 'templateName',
      header: () => t('template_name'),
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'email',
      header: () => t('user'),
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'data',
      header: () => t('input_data'),
      cell: (info) => {
        const data: JsonObject = info.getValue() as JsonObject;
        return JSON.stringify(data);
      },
    },
  ];

  return (
    <div className="overflow-x-auto">
      <h2 className="mb-4 text-2xl font-bold">
        {t('title')}
        {' '}
        {email}
      </h2>

      <div className="mb-4 flex items-center gap-4">
        <DatePickerWithRange
          date={dateRange}
          onDateChange={setDateRange}
        />

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
            <DataTable
              data={metrics}
              columns={columns}
              page={page}
              pageCount={totalPages}
              onPageChange={setPage}
            />
          )}
    </div>
  );
};

export default UsageMetrics;
