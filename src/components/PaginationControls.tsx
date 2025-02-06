import React from 'react';

import { Button } from './ui/button';

type PaginationProps = {
  page: number;
  totalPages: number;
  onNext: () => void;
  onPrevious: () => void;
};

const PaginationControls = ({ page, totalPages, onNext, onPrevious }: PaginationProps) => {
  return (
    <div className="mt-4 flex items-center justify-between">
      <Button
        onClick={onPrevious}
        disabled={page === 1}
        className={`rounded px-4 py-2 ${page === 1 ? 'cursor-not-allowed bg-gray-300 text-black' : 'bg-blue-500 text-white'
        }`}
      >
        Previous
      </Button>

      <span className="text-lg">
        Page
        {' '}
        {page}
        {' '}
        of
        {' '}
        {totalPages}
      </span>

      <Button
        onClick={onNext}
        disabled={page === totalPages}
        className={`rounded px-4 py-2 ${page === totalPages ? 'cursor-not-allowed bg-gray-300 text-black' : 'bg-blue-500 text-white'
        }`}
      >
        Next
      </Button>
    </div>
  );
};

export default PaginationControls;
