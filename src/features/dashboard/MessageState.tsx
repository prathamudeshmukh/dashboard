import React from 'react';

export const MessageState = (props: {
  title?: React.ReactNode;
  button?: React.ReactNode;
  table?: React.ReactNode;
}) => (
  <div className="flex h-[600px] flex-col rounded-md bg-card p-5">
    <div className="mt-3 text-center">
      <div className="text-xl font-semibold">{props.title}</div>
    </div>
    <div className="mt-5 flex items-end justify-end">{props.button}</div>
    <div className="mt-5">{props.table}</div>
  </div>
);
