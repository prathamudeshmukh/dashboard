'use client';

import { FileCode } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

type SampleJsonSchemaDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultJson?: string | undefined;
  onConfirm: () => void;
  disableConfirm?: boolean;
};

export default function SampleJsonSchemaDialog({ isOpen, onClose, defaultJson, onConfirm, disableConfirm }: SampleJsonSchemaDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl shadow-lg">
        <div className="flex items-start space-x-3">
          <div className="rounded-full bg-indigo-100 p-2">
            <FileCode className="size-5 text-indigo-600" />
          </div>
          <div>
            <DialogTitle className="text-lg font-semibold">Sample JSON Data Structure</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Here’s an example of the JSON structure for your template.
            </DialogDescription>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Based on the variables you've used, you can use a similar JSON object to pass data via our API. Replace the placeholder
          <code>"value"</code>
          {' '}
          with your dynamic data.
        </p>

        <div className="mt-4 max-h-[300px] overflow-auto rounded-md bg-zinc-900 p-4 font-mono text-sm text-white">
          <pre>{defaultJson}</pre>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={onConfirm} disabled={disableConfirm}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>

  );
}
