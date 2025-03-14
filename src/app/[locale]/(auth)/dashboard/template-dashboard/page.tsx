'use client';

import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

import HandlebarEditor from '../handlebar-editor/handlebar-editor';
import HtmlBuilder from '../html-builder/html-builder';

const TemplateDashboard = () => {
  const t = useTranslations('TemplateDashboard');
  const [activeTab, setActiveTab] = useState<'html' | 'handlebars'>('html');

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {/* Toggle Switch */}
      <div className="flex items-center">
        <button
          onClick={() => setActiveTab('html')}
          className={`rounded-sm px-4 py-2 shadow-sm ${
            activeTab === 'html' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          {t('button_label1')}
        </button>
        <button
          onClick={() => setActiveTab('handlebars')}
          className={`rounded-sm px-4 py-2 shadow-sm ${
            activeTab === 'handlebars' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          {t('button_label2')}
        </button>
      </div>

      {/* Render Components Conditionally */}
      <div className="mt-6">
        {activeTab === 'html' && <HtmlBuilder />}
        {activeTab === 'handlebars' && <HandlebarEditor />}
      </div>
    </div>
  );
};

export default TemplateDashboard;
