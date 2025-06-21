'use client';

import { Lightbulb } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import { EditorTypeEnum } from '@/types/Enum';

import EditorSwitchHeader from '../EditorSwitchHeader';
import HandlebarsEditor from '../HandlebarsEditor';
import HTMLBuilder from '../HTMLBuilder';

export default function TemplateEditorStep() {
  const { activeTab, setActiveTab } = useTemplateStore();
  // State for managing the confirmation dialog
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingTab, setPendingTab] = useState<EditorTypeEnum | null>(null);

  const handleTabChange = (tabName: string) => {
    if (tabName !== activeTab) {
      setPendingTab(tabName as EditorTypeEnum); // Store the tab they want to switch to
      setShowConfirmation(true); // Open the confirmation dialog
    }
  };

  const handleConfirmSwitch = () => {
    if (pendingTab) {
      setActiveTab(pendingTab);
    }
    setShowConfirmation(false);
    setPendingTab(null);
  };

  const handleCancelSwitch = () => {
    setShowConfirmation(false);
    setPendingTab(null);
  };

  return (
    <Card className="w-full border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-2xl font-semibold">Edit Template</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <EditorSwitchHeader activeTab={activeTab} onTabChange={handleTabChange} />

        {(activeTab === EditorTypeEnum.VISUAL)
        && (
          <>
            <div className="border-b bg-amber-50/50 p-4">
              <InfoMessage text="Drag and drop elements to build your template visually. Changes here will not affect your Handlebars template." />
            </div>
            <div className="p-4">
              <div className="min-h-[700px]">
                <HTMLBuilder />
              </div>
            </div>
          </>
        )}

        {(activeTab === EditorTypeEnum.HANDLEBARS)
        && (
          <>
            <div className="border-b bg-amber-50/50 p-4">
              <InfoMessage text="You're using the Code Editor, which give you full control over your template using Handlebars syntax. Need a simpler approach? Switch to the Visual Editor to build your template using drag-and-drop" />
            </div>
            <div className="p-4">
              <div className="min-h-[700px]">
                <HandlebarsEditor />
              </div>
            </div>
          </>
        )}

      </CardContent>
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={handleCancelSwitch} // Closing the dialog is like canceling
        onConfirm={handleConfirmSwitch}
        title="Switch Editor?"
        description={`Are you sure you want to switch to the ${pendingTab === EditorTypeEnum.VISUAL ? 'Visual' : 'Code'} Editor? Any unsaved changes in the current editor might be lost or not reflected in the new editor.`}
        confirmText="Yes, Switch"
        cancelText="No, Stay"
      />
    </Card>
  );
}

function InfoMessage({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Lightbulb className="text-orange-300" />
      <p className="text-base font-normal text-muted-foreground">{text}</p>
    </div>
  );
}
