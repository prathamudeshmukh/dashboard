'use client';

import { Eye, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { PanelHeader } from './PanelHeader';

type PreviewPanelProps = {
  preview: string;
  isLoading: boolean;
  renderCount: number;
  onRefresh: () => void;
};

export function PreviewPanel({
  preview,
  isLoading,
  renderCount,
  onRefresh,
}: PreviewPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <PanelHeader
        title="Preview"
        icon={<Eye className="size-3.5 text-gray-400" />}
        additionalInfo={
          !isLoading && (
            <span className="ml-2 text-xs text-gray-500">
              Render #
              {renderCount}
              {' '}
              •
              {' '}
              {new Date().toLocaleTimeString()}
            </span>
          )
        }
      />
      <div className="h-[400px] flex-1 overflow-auto bg-white p-4">
        {isLoading
          ? (
              <div className="flex h-full items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-b-2 border-gray-800"></div>
                <span className="ml-2 text-gray-800">Loading preview...</span>
              </div>
            )
          : (
              <iframe
                title="Handlebar Preview"
                sandbox=""
                className="size-full"
                srcDoc={preview}
              />
            )}
      </div>
      <div className="flex items-center justify-end border-t border-gray-700 bg-[#252526] p-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-gray-400 hover:bg-[#37373d] hover:text-white"
                onClick={onRefresh}
              >
                <RefreshCw className="mr-2 size-3.5" />
                Refresh Preview
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh the preview with current template and data</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
