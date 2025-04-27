'use client';

import { Eye, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { PREVIEW_STYLES_PREFIX, PREVIEW_STYLES_SUFFIX } from './constants';
import { PanelHeader } from './PanelHeader';
import { copyToClipboard } from './utils';

type PreviewPanelProps = {
  preview: string;
  styles: string;
  isLoading: boolean;
  renderCount: number;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onRefresh: () => void;
  pageSettings?: {
    orientation: string;
    size: string;
    margins: {
      top: string;
      right: string;
      bottom: string;
      left: string;
    };
    showBorder: boolean;
  };
};

export function PreviewPanel({
  preview,
  styles,
  isLoading,
  renderCount,
  isMaximized,
  onToggleMaximize,
  onRefresh,
  pageSettings,
}: PreviewPanelProps) {
  const handleCopy = async () => {
    await copyToClipboard(preview);
  };

  // Generate additional CSS for page layout
  const pageLayoutStyles = pageSettings
    ? `
      @page {
        size: ${pageSettings.size} ${pageSettings.orientation};
        margin: ${pageSettings.margins.top} ${pageSettings.margins.right} ${pageSettings.margins.bottom} ${pageSettings.margins.left};
      }
      .preview-container {
        width: 100%;
        height: 100%;
        ${
          pageSettings.showBorder
            ? `
            border: 1px dashed #ccc;
            padding: ${pageSettings.margins.top} ${pageSettings.margins.right} ${pageSettings.margins.bottom} ${pageSettings.margins.left};
            box-sizing: border-box;
            `
            : ''
        }
      }
    `
    : '';

  return (
    <div className="flex h-full flex-col">
      <PanelHeader
        title="PREVIEW"
        icon={<Eye className="size-3.5 text-gray-400" />}
        isMaximized={isMaximized}
        onCopy={handleCopy}
        onToggleMaximize={onToggleMaximize}
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
      <div className="flex-1 overflow-auto bg-white p-4">
        {isLoading
          ? (
              <div className="flex h-full items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-b-2 border-gray-800"></div>
                <span className="ml-2 text-gray-800">Loading preview...</span>
              </div>
            )
          : (
              <div
                className={`preview-container ${pageSettings?.orientation === 'landscape' ? 'landscape' : 'portrait'}`}
                dangerouslySetInnerHTML={{
                  __html: PREVIEW_STYLES_PREFIX + pageLayoutStyles + styles + PREVIEW_STYLES_SUFFIX + preview,
                }}
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
