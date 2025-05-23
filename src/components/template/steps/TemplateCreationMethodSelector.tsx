'use client';

import { FileText, Upload } from 'lucide-react';
import { useEffect } from 'react';

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import { CreationMethodEnum } from '@/types/Enum';

export default function TemplateCreationMethodSelector() {
  const { creationMethod, setCreationMethod, resetTemplate, clearSuccessData } = useTemplateStore();

  useEffect(() => {
    resetTemplate();
    clearSuccessData();
  }, []);
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          creationMethod === CreationMethodEnum.EXTRACT_FROM_PDF ? 'ring-2 ring-primary' : 'border'
        }`}
        onClick={() => setCreationMethod(CreationMethodEnum.EXTRACT_FROM_PDF)}
      >
        <CardContent className="flex flex-col items-center p-6 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Upload className="size-8 text-primary" />
          </div>
          <CardTitle className="mb-2 text-4xl font-semibold">Extract from PDF</CardTitle>
          <p className="text-base font-normal text-muted-foreground">
            Upload a PDF document and we'll extract the content into a template
          </p>
        </CardContent>
      </Card>

      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          creationMethod === CreationMethodEnum.TEMPLATE_GALLERY ? 'ring-2 ring-primary' : 'border'
        }`}
        onClick={() => setCreationMethod(CreationMethodEnum.TEMPLATE_GALLERY)}
      >
        <CardContent className="flex flex-col items-center p-6 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <FileText className="size-8 text-primary" />
          </div>
          <CardTitle className="mb-2 text-4xl font-semibold">Template Gallery</CardTitle>
          <p className="text-base font-normal text-muted-foreground">
            Choose from our pre-designed templates and customize to your needs
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
