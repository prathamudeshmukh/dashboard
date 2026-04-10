'use client';

import { useUser } from '@clerk/nextjs';
import type { ColumnDef } from '@tanstack/react-table';
import { Copy, FileSearch, MoreHorizontal, Plus, Search, SquarePen, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef, useState } from 'react';
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
import { trackEvent } from '@/libs/analytics/trackEvent';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import { TemplateTableState } from '@/types/Enum';
import { TemplateType } from '@/types/Template';
import type { FetchTemplateResponse } from '@/types/Template/TemplateResponse';

import AsyncActionButton from '../../components/AsyncActionButton';
import { FtuxWelcome } from './FtuxWelcome';

type TemplateTableProps = {
  onFtuxChange?: (isFtux: boolean) => void;
};

const TemplateTable = ({ onFtuxChange }: TemplateTableProps) => {
  const [templateData, setTemplateData] = useState<FetchTemplateResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [templateToDelete, setTemplateToDelete] = useState<FetchTemplateResponse | null>(null);
  const [tableState, setTableState] = useState<TemplateTableState>(TemplateTableState.Loading);
  const { selectTemplate } = useTemplateStore();
  const ftuxEventFiredRef = useRef(false);

  const t = useTranslations('TemplateTable');
  const fetchTemplateData = async (email: string, currentPage: number, search: string) => {
    if (!email) {
      return;
    }
    setTableState(TemplateTableState.Loading);
    try {
      const response = await fetchTemplates({ email, page: currentPage, pageSize: 10, searchQuery: search });
      const isFirstLoad = currentPage === 1 && !search;
      const hasNoTemplates = response.data.length === 0;

      if (hasNoTemplates) {
        if (search) {
          setTableState(TemplateTableState.SearchNoResults);
        } else if (currentPage === 1) {
          setTableState(TemplateTableState.FTUX);
        } else {
          setTableState(TemplateTableState.Empty);
        }
      } else {
        setTableState(TemplateTableState.Success);
      }

      if (isFirstLoad) {
        trackEvent('dashboard_viewed', {
          user_id: email,
          first_time: hasNoTemplates,
        });
      }

      setTotalPages(response.totalPages);
      setTemplateData(response.data);
    } catch (err) {
      setTableState(TemplateTableState.Error);
      console.error(err);
      toast.error('Failed to load templates. Please try again.');
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }
    const email = user?.emailAddresses[0]?.emailAddress as string;
    fetchTemplateData(email, page, searchQuery);
  }, [user, page]);

  useEffect(() => {
    if (tableState === TemplateTableState.FTUX && user && !ftuxEventFiredRef.current) {
      ftuxEventFiredRef.current = true;
      const email = user.emailAddresses[0]?.emailAddress;
      if (email) {
        trackEvent('dashboard_ftux_shown', { user_id: email });
      }
    }
    onFtuxChange?.(tableState === TemplateTableState.FTUX);
  }, [tableState, user, onFtuxChange]);

  const handleEdit = (templateId: string, templateType: string) => {
    // Track engagement - (who edits which template and in which editor mode)
    trackEvent('template_edited', {
      templateId,
      templateType,
    });
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

  const columns: ColumnDef<FetchTemplateResponse>[] = [
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
          <div className="flex items-center gap-2">
            <span className="max-w-[140px] truncate" title={templateId}>
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
                  onClick={() => {
                    if (template.templateId) {
                      handlePreview(template.templateId);
                    }
                  }}
                >
                  <Button size="sm" variant="ghost">
                    <FileSearch />
                    Preview
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const { templateId, templateType } = template;
                    if (templateId && templateType) {
                      handleEdit(templateId, templateType);
                    }
                  }}
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
                        if (templateToDelete.templateId) {
                          await handleDelete(templateToDelete.templateId);
                        }
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

  const handleCreateTemplate = (location: 'ftux' | 'table_header') => {
    trackEvent('create_template_cta_clicked', {
      cta_location: location,
      user_has_templates: tableState !== TemplateTableState.FTUX,
    });
    router.push('/dashboard/create-template');
  };

  return (
    <div className="container mx-auto py-4">
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
        <FtuxWelcome onStart={() => handleCreateTemplate('ftux')} />
      )}

      {tableState !== TemplateTableState.Loading && tableState !== TemplateTableState.FTUX && (
        <>
          <div className="mt-5 flex items-end justify-end">
            <Button className="rounded-full bg-primary text-lg" onClick={() => handleCreateTemplate('table_header')}>
              <Plus />
              Create Template
            </Button>
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

      {tableState === TemplateTableState.Empty && (
        <p className="mt-10 text-center text-muted-foreground">
          No templates found on this page.
        </p>
      )}

      {tableState === TemplateTableState.Error && (
        <p className="mt-10 text-center text-destructive">
          Failed to load templates. Please refresh the page.
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
