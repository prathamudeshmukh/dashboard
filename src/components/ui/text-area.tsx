import * as React from 'react';

import { cn } from '@/utils/Helpers';

type TextAreaProps = {} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'block w-full h-52 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
        className,
      )}
      {...props}
    />
  ),
);

TextArea.displayName = 'TextArea';

export { TextArea };
