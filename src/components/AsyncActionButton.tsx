import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AsyncActionButtonProps = {
  onClick: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  isDisabled?: boolean;
};

export default function AsyncActionButton({
  onClick,
  children,
  className,
  isDisabled,
}: AsyncActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    setIsSuccess(false);

    try {
      await onClick();
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('AsyncActionButton error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || isDisabled}
      className={cn(className, 'flex items-center gap-2')}
    >
      {isLoading
        ? (
            <Loader2 className="size-4 animate-spin" />
          )
        : isSuccess
          ? (
              <Check className="size-4 text-green-500" />
            )
          : (
              children
            )}
    </Button>
  );
}
