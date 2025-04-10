'use client';

import type {
  ColumnDef,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from './button';

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  page,
  pageCount,
  onPageChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
  });

  // Generate an array of page numbers (e.g., [1, 2, 3, 4, 5])
  const generatePageNumbers = () => {
    const maxVisiblePages = 5; // Number of visible page numbers
    const pages: number[] = [];

    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="container mx-auto py-6">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length
            ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="text-base hover:bg-gray-100"
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )
            : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-gray-500">
                    No results.
                  </TableCell>
                </TableRow>
              )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={columns.length} className="text-right font-semibold text-gray-700">
              Total Records:
              {' '}
              {data.length}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-center space-x-1">
        {generatePageNumbers().map(pageNumber => (
          <Button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={`mt-6 rounded-md px-4 py-3 ${page === pageNumber ? 'bg-primary text-white' : 'bg-gray-300 hover:bg-gray-400'}`}
          >
            {pageNumber}
          </Button>
        ))}
      </div>
    </div>
  );
}
