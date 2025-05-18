'use client';

import {
  Eye,
  FileCode,
} from 'lucide-react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type EditorToolbarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export function EditorToolbar({
  activeTab,
  onTabChange,
}: EditorToolbarProps) {
  return (
    <>
      {/* Tab Navigation */}
      <div className="border-b border-gray-700 bg-[#252526]">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="h-9 w-full justify-start border-b border-gray-700 bg-transparent px-2">
            <TabsTrigger
              value="editor"
              className="h-9 rounded-none px-4 text-base font-normal data-[state=active]:border-x data-[state=active]:border-b-0 data-[state=active]:border-t data-[state=active]:border-gray-700 data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-secondary"
            >
              <FileCode className="mr-2 size-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="h-9 rounded-none px-4 text-base font-normal data-[state=active]:border-x data-[state=active]:border-b-0 data-[state=active]:border-t data-[state=active]:border-gray-700 data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-secondary"
            >
              <Eye className="mr-2 size-4" />
              Preview
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </>
  );
}
