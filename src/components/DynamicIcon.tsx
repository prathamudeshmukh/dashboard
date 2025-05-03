import * as Icons from 'lucide-react';

import { cn } from '@/lib/utils'; // Optional, for className merging

type DynamicLucideIconProps = {
  name: keyof typeof Icons;
  size?: number;
  strokeWidth?: number;
  color: string;
};

export function DynamicLucideIcon({
  name,
  size = 20,
  strokeWidth = 2,
  color,
}: DynamicLucideIconProps) {
  const LucideIcon = Icons[name] as React.FC<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;

  if (!LucideIcon) {
    return null;
  }

  return (
    <LucideIcon
      className={cn(`text-muted-foreground ${color}`)}
      size={size}
      strokeWidth={strokeWidth}
    />
  );
}
