'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextArea } from '@/components/ui/text-area';
import type { TemplateDetailsStepProps } from '@/types/Wizard';

export default function TemplateDetailsStep({
  templateName,
  setTemplateName,
  templateDescription,
  setTemplateDescription,
}: TemplateDetailsStepProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Label>Name</Label>
        <Input value={templateName} onChange={e => setTemplateName(e.target.value)} />
      </div>

      <div className="grid gap-2">
        <Label>Description</Label>
        <TextArea value={templateDescription} onChange={e => setTemplateDescription(e.target.value)} />
      </div>
    </div>
  );
}
