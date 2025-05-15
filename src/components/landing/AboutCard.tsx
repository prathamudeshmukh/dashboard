import React from 'react';

type AboutCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export const AboutCard = ({ icon, title, description }: AboutCardProps) => {
  return (
    <div className="flex flex-col">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-blue-50">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};
