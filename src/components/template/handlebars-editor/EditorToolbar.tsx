'use client';

import {
  Code,
  Download,
  Eye,
  FileCode,
  Paintbrush,
  Play,
  Redo,
  Save,
  Undo,
  Upload,
  Wand2,
} from 'lucide-react';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { downloadFile } from './utils';

type EditorToolbarProps = {
  onFormatCode: () => void;
  onGenerateWithAI: () => void;
  onSave: () => void;
  onRunPreview: () => void;
  handlebarsCode: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export function EditorToolbar({

  onFormatCode,
  onGenerateWithAI,
  onSave,
  onRunPreview,
  handlebarsCode,
  activeTab,
  onTabChange,
}: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    downloadFile(handlebarsCode, 'template.hbs');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* Main Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-700 bg-[#252526] p-2">
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  <FileCode className="mr-2 size-4" />
                  <span className="text-sm font-medium">template.hbs</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Current template file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="mx-1 h-4 border-r border-gray-600"></div>

        </div>

        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-gray-400 hover:bg-[#37373d] hover:text-white"
                  onClick={onSave}
                >
                  <Save className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save template (Ctrl+S)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-gray-400 hover:bg-[#37373d] hover:text-white"
                  onClick={onRunPreview}
                >
                  <Play className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Run preview (Ctrl+Enter)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="mx-1 h-4 border-r border-gray-600"></div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                >
                  <Undo className="size-4 text-gray-400 hover:bg-[#37373d] hover:text-white" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo (Ctrl+Z)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-gray-400 hover:bg-[#37373d] hover:text-white"
                >
                  <Redo className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo (Ctrl+Y)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="mx-1 h-4 border-r border-gray-600"></div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-gray-400 hover:bg-[#37373d] hover:text-white"
                  onClick={onFormatCode}
                >
                  <Code className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Format code (Alt+Shift+F)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-gray-400 hover:bg-[#37373d] hover:text-white"
                  onClick={handleDownload}
                >
                  <Download className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download template</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-gray-400 hover:bg-[#37373d] hover:text-white"
                  onClick={handleUploadClick}
                >
                  <Upload className="size-4" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".hbs,.handlebars,.html,.txt"
                    className="hidden"
                    onChange={(e) => {
                      // This will be handled by the parent component
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const event = { target: { files: [file] } }
                        // Pass the event up to the parent component
                        // This is a workaround since we can't directly pass the file upload handler
                        ;(window as any).handleFileUpload?.(event);
                      }
                    }}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload template</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="mx-1 h-4 border-r border-gray-600"></div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-gray-400 hover:bg-[#37373d] hover:text-white"
                  onClick={onGenerateWithAI}
                >
                  <Wand2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>AI Assist</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700 bg-[#252526]">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="h-9 w-full justify-start border-b border-gray-700 bg-transparent px-2">
            <TabsTrigger
              value="editor"
              className="h-9 rounded-none px-4 data-[state=active]:border-x data-[state=active]:border-b-0 data-[state=active]:border-t data-[state=active]:border-gray-700 data-[state=active]:bg-[#1e1e1e]"
            >
              <FileCode className="mr-2 size-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger
              value="styles"
              className="h-9 rounded-none px-4 data-[state=active]:border-x data-[state=active]:border-b-0 data-[state=active]:border-t data-[state=active]:border-gray-700 data-[state=active]:bg-[#1e1e1e]"
            >
              <Paintbrush className="mr-2 size-4" />
              Styles
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="h-9 rounded-none px-4 data-[state=active]:border-x data-[state=active]:border-b-0 data-[state=active]:border-t data-[state=active]:border-gray-700 data-[state=active]:bg-[#1e1e1e]"
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
