import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PDFExtractor from './PDFExtractor';

// Mock heavy dependencies
vi.mock('@/libs/actions/pdf', () => ({
  checkExtractionResult: vi.fn(),
}));
vi.mock('@/libs/analytics/trackEvent', () => ({
  trackEvent: vi.fn(),
}));
vi.mock('@/libs/pdfExtractionPoller', () => ({
  pollExtractionJob: vi.fn(),
}));
vi.mock('@/libs/store/TemplateStore', () => ({
  useTemplateStore: () => ({
    setHtmlContent: vi.fn(),
    setHandlebarsCode: vi.fn(),
    setHandlebarTemplateJson: vi.fn(),
    setExtractionQuality: vi.fn(),
    extractionQuality: null,
  }),
}));

describe('PDFExtractor — progress display', () => {
  it('shows the upload dropzone initially', () => {
    render(<PDFExtractor />);

    expect(screen.getByText(/drag & drop/i)).toBeInTheDocument();
  });
});
