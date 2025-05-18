'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextArea } from '@/components/ui/text-area';
import { useTemplateStore } from '@/libs/store/TemplateStore';

export default function TemplateDetailsStep() {
  const { templateName, templateDescription, setTemplateName, setTemplateDescription } = useTemplateStore();
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Label className="text-base font-normal">Name</Label>
        <Input className="text-base font-normal" value={templateName} onChange={e => setTemplateName(e.target.value)} />
      </div>

      <div className="grid gap-2">
        <Label className="text-base font-normal">Description</Label>
        <TextArea className="text-base font-normal" value={templateDescription} onChange={e => setTemplateDescription(e.target.value)} />
      </div>
    </div>
  );
}
