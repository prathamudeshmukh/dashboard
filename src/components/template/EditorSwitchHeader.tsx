import { Code, WandSparkles } from 'lucide-react';

import { Button } from '../ui/button';
import { EditorTypeEnum } from './steps/TemplateEditorStep';

type EditorSwitchHeaderProps = {
  activeTab: string;
  onTabChange: (value: string) => void;
};

export default function EditorSwitchHeader({ activeTab, onTabChange }: EditorSwitchHeaderProps) {
  const isVisualActive = activeTab === EditorTypeEnum.VISUAL;
  const targetEditor = isVisualActive ? 'Code Editor' : 'Visual Editor';
  const targetTab = isVisualActive ? EditorTypeEnum.HANDLEBARS : EditorTypeEnum.VISUAL;

  return (
    <div className="flex items-center justify-between border-b bg-background px-6 py-3">

      <div className="flex items-center gap-2 text-lg">
        <Code className="size-6" />
        <span className="font-medium">
          {isVisualActive ? 'Visual Editor' : 'Code Editor'}
        </span>
      </div>

      <Button
        variant="outline"
        onClick={() => onTabChange(targetTab)}
        className="flex items-center gap-2 text-base font-semibold"
      >
        <WandSparkles className="size-4" />
        Switch to
        {' '}
        {targetEditor}
      </Button>
    </div>
  );
}
