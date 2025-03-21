import React from 'react';

import { Card, CardContent } from '@/components/ui/card';

type StepCardProps = {
  title: string;
  description: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
};

export function StepCard({ title, description, icon, className = '' }: StepCardProps) {
  return (
    <Card className={`h-full bg-white ${className}`}>
      <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
        <div className="mt-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          {icon}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="text-sm text-muted-foreground">
          {description}
        </div>
      </CardContent>
    </Card>
  );
}
