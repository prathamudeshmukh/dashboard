'use client';

import { Copy, Maximize2, Minimize2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import type { PanelHeaderProps } from './types';

export function PanelHeader({ title, icon, isMaximized, onCopy, onToggleMaximize, additionalInfo }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-700 bg-[#252526] px-4 py-1">
      <div className="flex items-center">
        {icon}
        <Label className="ml-2 text-xs font-medium text-gray-400">{title}</Label>
        {additionalInfo}
      </div>
      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-gray-400 hover:bg-[#37373d] hover:text-white"
                onClick={onCopy}
              >
                <Copy className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy content</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-gray-400 hover:bg-[#37373d] hover:text-white"
                onClick={onToggleMaximize}
              >
                {isMaximized ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isMaximized ? 'Minimize' : 'Maximize'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
