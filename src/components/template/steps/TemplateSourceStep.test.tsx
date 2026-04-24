import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTemplateStore } from '@/libs/store/TemplateStore';
import { CreationMethodEnum } from '@/types/Enum';

import TemplateSourceStep from './TemplateSourceStep';

vi.mock('@/libs/actions/templates', () => ({
  fetchTemplatesFromGallery: vi.fn().mockResolvedValue([]),
}));

vi.mock('../PDFExtractor', () => ({
  default: () => <div data-testid="pdf-extractor">PDFExtractor</div>,
}));

vi.mock('../TemplateGallery', () => ({
  default: (props: Record<string, () => void>) => (
    <div data-testid="template-gallery">
      <button type="button" onClick={props.onUseAsIs}>Use as-is</button>
      <button type="button" onClick={props.onCustomize}>Customize</button>
    </div>
  ),
}));

describe('TemplateSourceStep', () => {
  const onUseAsIs = vi.fn();
  const onCustomize = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useTemplateStore.getState().resetTemplate();
  });

  function renderStep() {
    return render(<TemplateSourceStep onUseAsIs={onUseAsIs} onCustomize={onCustomize} />);
  }

  it('renders gallery by default', () => {
    renderStep();

    expect(screen.getByTestId('template-gallery')).toBeInTheDocument();
    expect(screen.queryByTestId('pdf-extractor')).not.toBeInTheDocument();
  });

  it('shows "Upload PDF instead" link', () => {
    renderStep();

    expect(screen.getByRole('button', { name: /upload pdf instead/i })).toBeInTheDocument();
  });

  it('switches to PDFExtractor when "Upload PDF instead" is clicked', () => {
    renderStep();
    fireEvent.click(screen.getByRole('button', { name: /upload pdf instead/i }));

    expect(screen.getByTestId('pdf-extractor')).toBeInTheDocument();
    expect(screen.queryByTestId('template-gallery')).not.toBeInTheDocument();
  });

  it('sets creationMethod to EXTRACT_FROM_PDF when switching to PDF view', () => {
    renderStep();
    fireEvent.click(screen.getByRole('button', { name: /upload pdf instead/i }));

    expect(useTemplateStore.getState().creationMethod).toBe(CreationMethodEnum.EXTRACT_FROM_PDF);
  });

  it('shows "Back to gallery" link in PDF view', () => {
    renderStep();
    fireEvent.click(screen.getByRole('button', { name: /upload pdf instead/i }));

    expect(screen.getByRole('button', { name: /back to gallery/i })).toBeInTheDocument();
  });

  it('returns to gallery when "Back to gallery" is clicked', () => {
    renderStep();
    fireEvent.click(screen.getByRole('button', { name: /upload pdf instead/i }));
    fireEvent.click(screen.getByRole('button', { name: /back to gallery/i }));

    expect(screen.getByTestId('template-gallery')).toBeInTheDocument();
    expect(useTemplateStore.getState().creationMethod).toBe(CreationMethodEnum.TEMPLATE_GALLERY);
  });

  it('passes onUseAsIs and onCustomize callbacks to gallery', () => {
    renderStep();
    fireEvent.click(screen.getByRole('button', { name: /use as-is/i }));

    expect(onUseAsIs).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /customize/i }));

    expect(onCustomize).toHaveBeenCalledTimes(1);
  });
});
