'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DatePickerWithRangeProps = {
  date?: DateRange;
  onDateChange: (date: DateRange | undefined) => void;
  className?: string;
};

export function DatePickerWithRange({ date, onDateChange, className }: DatePickerWithRangeProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className="flex w-[300px] items-center justify-start gap-2 text-left font-normal"
          >
            <CalendarIcon className="size-5 text-gray-500" />
            {date?.from
              ? (
                  date.to
                    ? (
                        <>
                          {format(date.from, 'LLL dd, y')}
                          {' '}
                          -
                          {format(date.to, 'LLL dd, y')}
                        </>
                      )
                    : (
                        format(date.from, 'LLL dd, y')
                      )
                )
              : (
                  <span>Pick a date range</span>
                )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2} // Show two months side-by-side
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
