import * as Icons from 'lucide-react';

import { cn } from '@/lib/utils'; // Optional, for className merging

type DynamicLucideIconProps = {
  name: keyof typeof Icons;
  className?: string;
  size?: number;
  strokeWidth?: number;
};

export function DynamicLucideIcon({
  name,
  className,
  size = 20,
  strokeWidth = 2,
}: DynamicLucideIconProps) {
  const LucideIcon = Icons[name] as React.FC<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;

  if (!LucideIcon) {
    return <span className="text-sm text-red-500">Invalid icon</span>;
  }

  return (
    <LucideIcon
      className={cn('text-muted-foreground', className)}
      size={size}
      strokeWidth={strokeWidth}
    />
  );
}
