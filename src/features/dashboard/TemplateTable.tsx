'use client';

import { useUser } from '@clerk/nextjs';
import { Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';
import type { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
import { deleteTemplate, fetchTemplates } from '@/libs/actions/templates';
import { type Template, TemplateType } from '@/types/Template';

const TemplateTable = () => {
  const [templateData, setTempldateData] = useState<any>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const { user } = useUser();
  const router = useRouter(); //

  const t = useTranslations('TemplateTable');

  const fetchTemplateData = async () => {
    if (!user) {
      return;
    }
    const email = user?.emailAddresses[0]?.emailAddress; // Example user ID
    const response = await fetchTemplates(email as string);
    setTempldateData(response.data);
  };

  useEffect(() => {
    fetchTemplateData();
  }, [user]);

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
      fetchTemplateData();
    } else {
      toast.success(`Failed to delete template: ${response.error}`);
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
      cell: info => info.getValue(),
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
              onClick={() => handleEdit(template.templateId!, template.templateType!)}

            >
              <Pencil2Icon />
            </Button>

            {/** Delete Confirmation Dialogue */}
            <AlertDialog>
              <AlertDialogTrigger>
                <Button
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

  return (
    <div className="container mx-auto py-10">
      <DataTable
        data={templateData}
        columns={columns}
        page={1}
        pageCount={1}
        onPageChange={num => num}
      />
    </div>
  );
};

export default TemplateTable;
