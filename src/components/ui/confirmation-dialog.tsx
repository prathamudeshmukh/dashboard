'use client';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

type ConfirmationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
};

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: ConfirmationDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onKeyDown={(e) => {
          // Allow closing with Enter or Space key when the backdrop is focused
          if (e.key === 'Enter' || e.key === ' ') {
            onClose();
          }
        }}
        role="button" // Indicate that this div acts as a button
        tabIndex={0} // Make it focusable via keyboard
        aria-label={cancelText || 'Close dialog'} // Provide an accessible label for the backdrop
      />

      {/* Dialog */}
      <Card className="relative z-10 mx-4 w-full max-w-md" role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2">
              <AlertTriangle className="size-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg" id="dialog-title">{title}</CardTitle>
            </div>
          </div>
          <CardDescription className="mt-2 text-sm text-muted-foreground" id="dialog-description">{description}</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {confirmText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
