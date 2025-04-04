'use client';

import { useUser } from '@clerk/nextjs';
import type { ColumnDef } from '@tanstack/react-table';
import { endOfDay, startOfDay } from 'date-fns';
import { debounce } from 'lodash';
import { Copy, MoreHorizontal, SquarePen, Trash2 } from 'lucide-react';
import Link from 'next/link';
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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { deleteTemplate, fetchTemplates } from '@/libs/actions/templates';
import { type Template, TemplateType } from '@/types/Template';

const TemplateTable = () => {
  const [templateData, setTemplateData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
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

  const handleDelete = async (templateId: string) => {
    if (!templateId) {
      return;
    }
    const response = await deleteTemplate(templateId);
    if (response.success) {
      toast.success('Template Deleted Successfully');
      debouncedFetchTemplates(user?.emailAddresses[0]?.emailAddress, page, searchQuery, dateRange);
    } else {
      toast.error(`Failed to delete template: ${response.error}`);
    }
  };

  const columns: ColumnDef<Template>[] = [
    {
      accessorKey: 'templateName',
      header: () => t('template_name'),
      cell: (info) => {
        const templateName = info.getValue();
        return (
          <div className="font-medium">
            {templateName as string}
          </div>
        );
      },
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
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              <Copy />
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

        const openDeleteDialog = () => {
          setTimeout(() => {
            setOpenDialog(true);
          }, 100);
        };

        const closeDeleteDialog = () => {
          setOpenDialog(false);
        };

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() =>
                    handleEdit(template.templateId!, template.templateType!)}
                >
                  <Button size="sm" variant="ghost">
                    <SquarePen />
                    Edit
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openDeleteDialog}>
                  <Button size="sm" variant="ghost">
                    <Trash2 />
                    Delete
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this template? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel onClick={closeDeleteDialog}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      handleDelete(template.templateId as string);
                      setOpenDialog(false);
                    }}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        );
      },
    },

  ];

  const handleDateFilterReset = () => {
    setDateRange({ from: undefined, to: undefined });
    setPage(1);
  };

  const handleCreateTemplate = () => {
    router.push('/dashboard/template-dashboard');
  };

  return (
    <div className="container mx-auto py-10">
      {templateData.length === 0
        ? (
            <div className="flex h-96 flex-col items-center justify-center text-center">
              <h2 className="mb-2 text-2xl font-semibold">Welcome to Templify</h2>
              <p className="mb-4 text-gray-600">
                Your one-stop solution to your dynamic PDF generation needs.
              </p>
              <Button onClick={handleCreateTemplate} className="px-6 py-2">
                Create your first template
              </Button>
            </div>
          )
        : (
            <>
              <div className="mt-5 flex items-end justify-end">
                <Link href="/dashboard/template-dashboard">
                  <Button>Create New Template</Button>
                </Link>
              </div>
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
            </>
          )}
    </div>
  );
};

export default TemplateTable;
