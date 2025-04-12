import axios from 'axios';
import { FileUp, TriangleAlert, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';

import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

const PDFExtractor = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      setIsUploading(true);
      setUploadError(null);
      setProgress(0);

      await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (e: any) => {
          if (e.total) {
            const percent = Math.round((e.loaded * 100) / e.total);
            setProgress(percent);
          }
        },
      });
    } catch (error: any) {
      setUploadError(`Upload failed. Please try again - ${error}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      await uploadFile(file);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      await uploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div>
      <div className="mb-4 flex items-start rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
        <TriangleAlert className="mr-3 mt-0.5 text-amber-600" />
        <div>
          <p className="font-medium text-amber-800">Free Plan Limit</p>
          <p className="mt-0.5 text-xs text-amber-700">
            Your free plan includes extraction from 3 PDFs.
            {' '}
            <a href="#demo" className="font-medium underline">
              Upgrade to Pro
            </a>
            {' '}
            for unlimited template extraction and additional features.
          </p>
        </div>
      </div>

      <div
        className="rounded-lg border-2 border-dashed border-primary/30 p-8 text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          accept=".pdf"
          name="pdf"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-primary/10 p-4">
            <FileUp className="size-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">Drag & drop your PDF here</p>
            <p className="text-sm text-muted-foreground">or</p>
          </div>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 size-4" />
            Browse Files
          </Button>
          <p className="text-xs text-muted-foreground">Supported format: PDF (Max size: 4MB)</p>
        </div>

        {isUploading && (
          <div className="mt-6">
            <Progress value={progress} className="h-2" />
            <p className="mt-1 text-sm text-muted-foreground">
              Uploading...
              {progress}
              %
            </p>
          </div>
        )}

        {uploadError && (
          <p className="mt-2 text-center text-sm text-red-500">{uploadError}</p>
        )}
      </div>
    </div>
  );
};

export default PDFExtractor;
