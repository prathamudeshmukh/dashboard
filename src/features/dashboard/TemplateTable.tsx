'use client';

import { useUser } from '@clerk/nextjs';
import { CopyIcon, Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';
import type { ColumnDef } from '@tanstack/react-table';
import { endOfDay, startOfDay } from 'date-fns';
import { debounce } from 'lodash';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { toast } from 'sonner';

import { DatePickerWithRange } from '@/components/DatePickerWithRange';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { deleteTemplate, fetchTemplates } from '@/libs/actions/templates';
import { type Template, TemplateType } from '@/types/Template';

const TemplateTable = () => {
  const [templateData, setTemplateData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const t = useTranslations('TemplateTable');

  const debouncedFetchTemplates = useCallback(
    debounce(async (email, page, searchQuery, dateRange) => {
      if (!email) {
        return;
      }

      const response = await fetchTemplates({
        email,
        page,
        pageSize: 10,
        searchQuery,
        startDate: dateRange?.from ? startOfDay(dateRange.from) : undefined,
        endDate: dateRange?.to ? endOfDay(dateRange.to) : undefined,
      });

      setTotalPages(response.totalPages);
      setTemplateData(response.data);
    }, 500),
    [],
  );

  useEffect(() => {
    if (!user) {
      return;
    }
    const email = user?.emailAddresses[0]?.emailAddress;
    debouncedFetchTemplates(email, page, searchQuery, dateRange);
  }, [user, page, searchQuery, dateRange, debouncedFetchTemplates]);

  const handleEdit = (templateId: string, templateType: string) => {
    if (templateType === TemplateType.HTML_BUILDER) {
      router.push(`/dashboard/html-builder?templateId=${templateId}`);
    } else {
      router.push(`/dashboard/handlebar-editor?templateId=${templateId}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplateId) {
      return;
    }
    const response = await deleteTemplate(selectedTemplateId);
    if (response.success) {
      toast.success('Template Deleted Successfully');
      debouncedFetchTemplates(user?.emailAddresses[0]?.emailAddress, page, searchQuery, dateRange);
    } else {
      toast.error(`Failed to delete template: ${response.error}`);
    }
    setSelectedTemplateId(null);
  };

  const columns: ColumnDef<Template>[] = [
    {
      accessorKey: 'templateName',
      header: () => t('template_name'),
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'templateId',
      header: () => t('id'),
      cell: (info) => {
        const templateId = info.getValue() as string;

        const handleCopy = () => {
          navigator.clipboard.writeText(templateId);
          toast.success('Template ID copied to clipboard');
        };

        return (
          <div className="flex items-center gap-2">
            <span>{templateId}</span>
            <Button variant="outline" onClick={handleCopy}>
              <CopyIcon />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: () => t('description'),
      cell: (info) => {
        const description = info.getValue();
        return (
          <div className="min-w-[250px] max-w-[500px] whitespace-pre-wrap break-words">
            {description as string}
          </div>
        );
      },
      meta: {
        size: 300, // Set default column width
      },
    },
    {
      accessorKey: 'templateType',
      header: () => t('type'),
      cell: info => info.getValue(),
    },
    {
      id: 'actions',
      header: () => 'Actions',
      cell: ({ row }) => {
        const template = row.original;

        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleEdit(template.templateId!, template.templateType!)}
            >
              <Pencil2Icon />
            </Button>

            {/** Delete Confirmation Dialogue */}
            <AlertDialog>
              <AlertDialogTrigger>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTemplateId(template.templateId!)}
                >
                  <TrashIcon />
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this template? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSelectedTemplateId(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },

  ];

  const handleDateFilterReset = () => {
    setDateRange({ from: undefined, to: undefined });
    setPage(1);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center gap-4">
        <Input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search templates..."
          className="w-1/3 rounded-md border p-2"
        />

        <DatePickerWithRange
          date={dateRange}
          onDateChange={setDateRange}
        />

        <Button
          onClick={handleDateFilterReset}
        >
          Reset Filters
        </Button>
      </div>

      <DataTable
        data={templateData}
        columns={columns}
        page={page}
        pageCount={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default TemplateTable;
