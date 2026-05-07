'use client';

import axios from 'axios';
import { AlertTriangle, Check, FileUp, Loader2, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';

import { checkExtractionResult } from '@/libs/actions/pdf';
import { trackEvent } from '@/libs/analytics/trackEvent';
import type { ExtractionQuality } from '@/libs/computeExtractionQuality';
import { pollExtractionJob } from '@/libs/pdfExtractionPoller';
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

function ExtractionQualityAlert({ quality }: { quality: ExtractionQuality }) {
  if (quality.score === 'good') {
    return (
      <Alert className="border-green-200 bg-green-50">
        <Check className="size-4 text-green-600" />
        <AlertTitle className="text-green-800">{quality.label}</AlertTitle>
        <AlertDescription className="text-green-700">
          {quality.details}
          . Continue to the next step to customize your template.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-amber-200 bg-amber-50">
      <AlertTriangle className="size-4 text-amber-600" />
      <AlertTitle className="text-amber-800">{quality.label}</AlertTitle>
      <AlertDescription className="text-amber-700">
        {quality.details}
        . You can refine the template in the editor.
      </AlertDescription>
    </Alert>
  );
}

const PDFExtractor = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const [pdfUploadStatus, setPdfUploadStatus] = useState(PdfUploadStatusEnum.NOT_STARTED);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pdfExtractionStatus, setpdfExtractionStatus] = useState<PdfExtractionStatusEnum>(PdfExtractionStatusEnum.NOT_STARTED);
  const [extractionProgress, setExtractionProgress] = useState({ pagesDone: 0, pagesTotal: 0 });
  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
  const { setHtmlContent, setHandlebarsCode, setHandlebarTemplateJson, setExtractionQuality, extractionQuality } = useTemplateStore();

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      setPdfUploadStatus(PdfUploadStatusEnum.IN_PROGRESS);
      setUploadError(null);
      setProgress(0);

      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e: any) => {
          if (e.total) {
            setProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      });
      setPdfUploadStatus(PdfUploadStatusEnum.COMPLETETD);
      setpdfExtractionStatus(PdfExtractionStatusEnum.IN_PROGRESS);

      const pdfId: string = response.data.result.pdfId;
      await pollExtractionJob(
        pdfId,
        file,
        Date.now(),
        { setHtmlContent, setHandlebarsCode, setHandlebarTemplateJson, setExtractionQuality },
        {
          onCompleted: () => setpdfExtractionStatus(PdfExtractionStatusEnum.COMPLETED),
          onFailed: () => setpdfExtractionStatus(PdfExtractionStatusEnum.FAILED),
          onProgress: (pagesDone, pagesTotal) =>
            setExtractionProgress({ pagesDone, pagesTotal }),
        },
        checkExtractionResult,
        trackEvent,
      );
    } catch (error: any) {
      setPdfUploadStatus(PdfUploadStatusEnum.FAILED);
      setUploadError(`Upload failed. Please try again - ${error}`);
      trackEvent('template_import_failed', {
        pdf_id: '',
        file_name: file.name,
        file_size: file.size,
        failure_stage: 'upload',
        error_message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError('File size should not exceed 15 MB.');
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
        setUploadError('File size should not exceed 15 MB.');
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
            <p className="text-base font-normal text-muted-foreground">Supported format: PDF (Max size: 15 MB)</p>
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

      <div className="mt-6 space-y-4">
        {pdfExtractionStatus === PdfExtractionStatusEnum.IN_PROGRESS && (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-4">
              <div className="flex w-full max-w-sm flex-col items-center space-y-3">
                {extractionProgress.pagesTotal === 0
                  ? (
                      <>
                        <Loader2 className="size-8 animate-spin text-primary" />
                        <p className="text-sm font-medium">Queued for processing...</p>
                      </>
                    )
                  : (
                      <>
                        <p className="text-sm font-medium">
                          Processing page
                          {' '}
                          {extractionProgress.pagesDone}
                          {' '}
                          of
                          {' '}
                          {extractionProgress.pagesTotal}
                        </p>
                        <Progress
                          value={(extractionProgress.pagesDone / extractionProgress.pagesTotal) * 100}
                          className="h-2 w-full"
                        />
                      </>
                    )}
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
            {extractionQuality
              ? <ExtractionQualityAlert quality={extractionQuality} />
              : (
                  <Alert className="border-green-200 bg-green-50">
                    <Check className="size-4 text-green-600" />
                    <AlertTitle className="text-green-800">PDF Processed Successfully</AlertTitle>
                    <AlertDescription className="text-green-700">
                      We've extracted the template from your PDF. Continue to the next step to customize your template details.
                    </AlertDescription>
                  </Alert>
                )}

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
