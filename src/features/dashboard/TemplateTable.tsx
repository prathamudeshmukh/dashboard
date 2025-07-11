'use client';

import { useUser } from '@clerk/nextjs';
import type { ColumnDef } from '@tanstack/react-table';
import { Copy, FileSearch, MoreHorizontal, Plus, Search, SquarePen, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
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
import { Skeleton } from '@/components/ui/skeleton';
import { deleteTemplate, fetchTemplates } from '@/libs/actions/templates';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import { TemplateTableState } from '@/types/Enum';
import { type Template, TemplateType } from '@/types/Template';

import AsyncActionButton from '../../components/AsyncActionButton';

const TemplateTable = () => {
  const [templateData, setTemplateData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const [tableState, setTableState] = useState<TemplateTableState>(TemplateTableState.Loading);
  const { selectTemplate } = useTemplateStore();

  const t = useTranslations('TemplateTable');
  const fetchTemplateData = async (email: string, page: number, search: string) => {
    if (!email) {
      return;
    }
    const start = performance.now();
    setTableState(TemplateTableState.Loading);
    try {
      const response = await fetchTemplates({ email, page, pageSize: 10, searchQuery: search });
      const end = performance.now();
      // eslint-disable-next-line no-console
      console.log(`Fetching templates took ${end - start} ms`);
      if (response.data.length === 0) {
        setTableState(search ? TemplateTableState.SearchNoResults : TemplateTableState.FTUX);
      } else {
        setTableState(TemplateTableState.Success);
      }

      setTotalPages(response.totalPages);
      setTemplateData(response.data);
    } catch (err) {
      setTableState(TemplateTableState.Error);
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }
    const email = user?.emailAddresses[0]?.emailAddress as string;
    fetchTemplateData(email, page, searchQuery);
  }, [user, page]);

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
      const email = user?.emailAddresses[0]?.emailAddress as string;
      fetchTemplateData(email, page, searchQuery);
    } else {
      toast.error(`Failed to delete template: ${response.error}`);
    }
  };
  const handlePreview = async (templateId: string) => {
    selectTemplate(templateId);
    router.push(`/dashboard/template/preview`);
  };

  const columns: ColumnDef<Template>[] = [
    {
      accessorKey: 'templateName',
      header: () => t('template_name'),
      cell: (info) => {
        const templateName = info.getValue();
        return (
          <div>
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
          <div className="flex min-w-[300px] items-center gap-2">
            <span className="max-w-[220px] truncate" title={templateId}>
              {templateId}
            </span>
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
          <div className="flex">
            <span className="max-w-[220px] truncate">
              {description as string}
            </span>
          </div>
        );
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
          setTemplateToDelete(template);
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
                    handlePreview(template.templateId as string)}
                >
                  <Button size="sm" variant="ghost">
                    <FileSearch />
                    Preview
                  </Button>
                </DropdownMenuItem>
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

            {templateToDelete && (
              <AlertDialog
                open={!!templateToDelete}
                onOpenChange={(open) => {
                  if (!open) {
                    setTemplateToDelete(null);
                  }
                }}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this template? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setTemplateToDelete(null)}>
                      Cancel
                    </AlertDialogCancel>
                    <AsyncActionButton
                      onClick={async () => {
                        await handleDelete(templateToDelete.templateId as string);
                        setTemplateToDelete(null);
                      }}
                    >
                      Delete
                    </AsyncActionButton>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        );
      },
    },

  ];

  const handleCreateTemplate = () => {
    router.push('/dashboard/create-template');
  };

  return (
    <div className="container mx-auto py-10">
      {tableState === TemplateTableState.Loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 border-b pb-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-6 w-1/5" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      )}

      {tableState === TemplateTableState.FTUX && (
        <div className="flex h-96 flex-col items-center justify-center text-center">
          <h2 className="mb-2 text-6xl font-semibold">Welcome to Templify</h2>
          <p className="mb-4 text-base font-normal text-gray-600">
            Your one-stop solution to your dynamic PDF generation needs.
          </p>
          <Button onClick={handleCreateTemplate} className="rounded-full bg-primary text-lg">
            Create your first template
          </Button>
        </div>
      )}

      {tableState !== TemplateTableState.Loading && tableState !== TemplateTableState.FTUX && (
        <>
          <div className="mt-5 flex items-end justify-end">
            <Link href="/dashboard/create-template">
              <Button className="rounded-full bg-primary text-lg">
                <Plus />
                Create Template
              </Button>
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
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const email = user?.emailAddresses[0]?.emailAddress;
                if (email) {
                  fetchTemplateData(email, page, searchQuery);
                }
              }}
            >
              <Search />
            </Button>
          </div>
        </>
      )}

      {tableState === TemplateTableState.SearchNoResults && (
        <p className="mt-10 text-center text-muted-foreground">
          No results found for this search.
        </p>
      )}

      {tableState === TemplateTableState.Success && (
        <DataTable
          data={templateData}
          columns={columns}
          page={page}
          pageCount={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default TemplateTable;
