import React from 'react';

type StepCardProps = {
  stepNumber: number;
  title: string;
  description: React.ReactNode;
  icon: React.ReactNode;
};

export const StepCard = ({ stepNumber, title, description, icon }: StepCardProps) => {
  return (
    <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
      <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-lg font-bold text-primary-foreground">
        {stepNumber}
      </div>

      <h3 className="text-xl font-bold">{title}</h3>

      <p className="text-md text-muted-foreground">{description}</p>

      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
    </div>
  );
};
