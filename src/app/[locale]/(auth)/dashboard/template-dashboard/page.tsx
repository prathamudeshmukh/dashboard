'use client';

import React, { useState } from 'react';

import HandlebarsPlayground from '../handlebars-playground/page';
import HtmlBuilder from '../html-builder/page';

const TemplateDashboard = () => {
  const [activeTab, setActiveTab] = useState<'html' | 'handlebars'>('html');

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Template Dashboard</h1>

      {/* Toggle Switch */}
      <div className="flex items-center">
        <button
          onClick={() => setActiveTab('html')}
          className={`rounded-sm px-4 py-2 shadow-sm ${
            activeTab === 'html' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          HTML Builder
        </button>
        <button
          onClick={() => setActiveTab('handlebars')}
          className={`rounded-sm px-4 py-2 shadow-sm ${
            activeTab === 'handlebars' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          Handlebars Playground
        </button>
      </div>

      {/* Render Components Conditionally */}
      <div className="mt-6">
        {activeTab === 'html' && <HtmlBuilder />}
        {activeTab === 'handlebars' && <HandlebarsPlayground />}
      </div>
    </div>
  );
};

export default TemplateDashboard;
