'use client';

import { FileCode } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

import { JsonEditor } from '../handlebars-editor/JsonEditor';

type DataSourceDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultJson: string;
  onConfirm: (json: string) => void;
};

export default function DataSourceDialog({
  isOpen,
  onClose,
  defaultJson,
  onConfirm,
}: DataSourceDialogProps) {
  const [jsonValue, setJsonValue] = useState(defaultJson);

  // Reset text when dialog opens
  useEffect(() => {
    if (isOpen) {
      setJsonValue(defaultJson);
    }
  }, [isOpen, defaultJson]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-2xl shadow-lg">
        <div className="flex items-start space-x-3">
          <div className="rounded-full bg-indigo-100 p-2">
            <FileCode className="size-5 text-indigo-600" />
          </div>
          <div>
            <DialogTitle className="text-lg font-semibold">Edit Data Source JSON</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Update the JSON schema. Make sure it is valid JSON format.
            </DialogDescription>
          </div>
        </div>
        <JsonEditor
          json={defaultJson}
          onChange={json => setJsonValue(json)}
          error=""
          isReady={true}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              try {
                JSON.parse(jsonValue); // validate
                onConfirm(jsonValue);
                onClose();
              } catch (e) {
                console.error(`Invalid JSON format: ${e}`);
                toast.error('Invalid JSON format');
              }
            }}
          >
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
