import axios from 'axios';
import { Check, FileUp, Loader2, TriangleAlert, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';

import { getStatus } from '@/libs/actions/pdf';
import { useTemplateStore } from '@/libs/store/TemplateStore';

import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

enum PdfExtractionStatusEnum {
  NOT_STARTED,
  IN_PROGRESS,
  COMPLETED,
  FAILED,
}

enum PdfUploadStatusEnum {
  NOT_STARTED,
  IN_PROGRESS,
  COMPLETETD,
  FAILED,
}

const PDFExtractor = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const [pdfUploadStatus, setPdfUploadStatus] = useState(PdfUploadStatusEnum.NOT_STARTED);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pdfExtractionStatus, setpdfExtractionStatus] = useState<PdfExtractionStatusEnum>(PdfExtractionStatusEnum.NOT_STARTED);
  const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
  const { setHtmlContent, setHandlebarsCode } = useTemplateStore();

  async function pollJobStatus(runID: string) {
    let attempts = 0;
    const maxAttempts = 5; // You can adjust this value
    const initialDelay = 1000; // 1 second, you can adjust this

    while (attempts < maxAttempts) {
      try {
        let response = await getStatus(runID);

        // Once we get a status, we can start the main polling logic
        while (response.status !== 'Completed') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          response = await getStatus(runID);

          if (response.status === 'Failed' || response.status === 'Cancelled') {
            setpdfExtractionStatus(PdfExtractionStatusEnum.FAILED);
            return; // Exit the function
          }
        }

        if (response.status === 'Completed') {
          setpdfExtractionStatus(PdfExtractionStatusEnum.COMPLETED);
          setHtmlContent(response.output.htmlContent);
          setHandlebarsCode(response.output.htmlContent);
        }
        return; // Job finished, exit the function
      } catch (error: any) {
        if (error.message.includes('No status found')) {
          attempts++;
          if (attempts >= maxAttempts) {
            console.error('Max attempts reached. Could not find status for run ID:', runID);
            setpdfExtractionStatus(PdfExtractionStatusEnum.FAILED);
            return;
          }
          await new Promise(resolve => setTimeout(resolve, initialDelay * attempts)); // Exponential backoff
        } else {
          // Handle other errors
          console.error('An unexpected error occurred:', error);
          setpdfExtractionStatus(PdfExtractionStatusEnum.FAILED);
          return;
        }
      }
    }
  }

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      setPdfUploadStatus(PdfUploadStatusEnum.IN_PROGRESS);
      setUploadError(null);
      setProgress(0);

      const response = await axios.post('/api/upload', formData, {
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
      setPdfUploadStatus(PdfUploadStatusEnum.COMPLETETD);
      setpdfExtractionStatus(PdfExtractionStatusEnum.IN_PROGRESS);
      pollJobStatus(response.data.runID);
    } catch (error: any) {
      setPdfUploadStatus(PdfUploadStatusEnum.FAILED);
      setUploadError(`Upload failed. Please try again - ${error}`);
    } finally {
      setPdfUploadStatus(PdfUploadStatusEnum.FAILED);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError('File size should not exceed 4MB.');
        return;
      }

      if (file.type === 'application/pdf') {
        await uploadFile(file);
      } else {
        setUploadError('Only PDF files are supported.');
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError('File size should not exceed 4MB.');
        return;
      }

      if (file.type === 'application/pdf') {
        await uploadFile(file);
      } else {
        setUploadError('Only PDF files are supported.');
      }
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
          <p className="text-base font-normal text-amber-800">Free Plan Limit</p>
          <p className="mt-0.5 text-base text-amber-700">
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

      {pdfExtractionStatus === PdfExtractionStatusEnum.NOT_STARTED && (
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

          {/* Default UI */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <FileUp className="size-8 text-primary" />
            </div>
            <div>
              <p className="text-4xl font-semibold">Drag & drop your PDF here</p>
              <p className="text-base text-muted-foreground">or</p>
            </div>
            <Button className="rounded-full text-xl font-normal" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 size-4" />
              Browse Files
            </Button>
            <p className="text-base font-normal text-muted-foreground">Supported format: PDF (Max size: 4MB)</p>
          </div>

          {pdfUploadStatus === PdfUploadStatusEnum.IN_PROGRESS && (
            <div className="mt-6">
              <Progress value={progress} className="h-2" />
              <p className="mt-1 text-base font-normal text-muted-foreground">
                Uploading...
                {progress}
                %
              </p>
            </div>
          )}

          {pdfUploadStatus === PdfUploadStatusEnum.FAILED && (
            <p className="mt-2 text-center text-sm text-red-500">{uploadError}</p>
          )}
        </div>
      )}

      {/* Dynamic status UI */}
      <div className="mt-6 space-y-4">
        {pdfExtractionStatus === PdfExtractionStatusEnum.IN_PROGRESS && (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-4">
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Processing PDF...</p>
                <p className="text-xs text-muted-foreground">Extracting styles and structure</p>
              </div>
            </div>
          </div>
        )}

        {pdfExtractionStatus === PdfExtractionStatusEnum.FAILED && (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-4">
              <div className="flex flex-col items-center space-y-2">
                <p className="text-sm font-medium">Processing Failed</p>
              </div>
            </div>
          </div>
        )}

        {pdfExtractionStatus === PdfExtractionStatusEnum.COMPLETED && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <Check className="size-4 text-green-600" />
              <AlertTitle className="text-green-800">PDF Processed Successfully</AlertTitle>
              <AlertDescription className="text-green-700">
                We've extracted the template from your PDF. Continue to the next step to customize your template details.
              </AlertDescription>
            </Alert>

            <div className="mt-4 border-t pt-4">
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <Check className="mr-2 size-4 text-green-600" />
                <span>HTML structure generated</span>
              </div>
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <Check className="mr-2 size-4 text-green-600" />
                <span>Template ready for customization</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFExtractor;
