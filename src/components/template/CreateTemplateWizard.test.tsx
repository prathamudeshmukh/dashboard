import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTemplateStore } from '@/libs/store/TemplateStore';

import CreateTemplateWizard from './CreateTemplateWizard';

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: { emailAddresses: [{ emailAddress: 'test@example.com' }], id: 'u1' } }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/libs/analytics/trackEvent', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('@/libs/actions/templates', () => ({
  UpsertTemplate: vi.fn(),
  PublishTemplateToProd: vi.fn(),
  fetchTemplatesFromGallery: vi.fn().mockResolvedValue([
    {
      id: 'tpl-1',
      title: 'Invoice',
      description: 'A standard invoice template',
      category: 'Finance',
      icon: 'FileText',
      color: '#000',
      htmlContent: '<p>invoice</p>',
      handlebarContent: '{{name}}',
      sampleData: null,
      style: null,
      previewHtmlContent: null,
      typeKey: 'invoice-template',
      variantName: null,
    },
  ]),
}));

vi.mock('./steps/TemplateSourceStep', () => ({
  default: (props: Record<string, () => void>) => (
    <div data-testid="source-step">
      <button type="button" onClick={props.onUseAsIs}>Use as-is</button>
      <button type="button" onClick={props.onCustomize}>Customize</button>
    </div>
  ),
}));

vi.mock('./steps/TemplateEditorStep', () => ({
  default: () => <div data-testid="editor-step">Editor</div>,
}));

vi.mock('./steps/TemplateReviewStep', () => ({
  default: () => <div data-testid="review-step">Review</div>,
}));

describe('CreateTemplateWizard', () => {
  beforeEach(() => {
    useTemplateStore.getState().resetTemplate();
  });

  it('starts on gallery step (no method selector)', () => {
    render(<CreateTemplateWizard />);

    expect(screen.getByTestId('source-step')).toBeInTheDocument();
    expect(screen.queryByText('Choose Method')).not.toBeInTheDocument();
  });

  it('"Use as-is" advances directly to review step', () => {
    render(<CreateTemplateWizard />);
    fireEvent.click(screen.getByRole('button', { name: /use as-is/i }));

    expect(screen.getByTestId('review-step')).toBeInTheDocument();
    expect(screen.queryByTestId('editor-step')).not.toBeInTheDocument();
  });

  it('"Customize" advances to editor step', () => {
    render(<CreateTemplateWizard />);
    fireEvent.click(screen.getByRole('button', { name: /customize/i }));

    expect(screen.getByTestId('editor-step')).toBeInTheDocument();
  });

  it('progress bar shows 2 steps on "Use as-is" path', () => {
    render(<CreateTemplateWizard />);
    fireEvent.click(screen.getByRole('button', { name: /use as-is/i }));
    const stepLabels = screen.getAllByText(/select template|review & save/i);

    expect(stepLabels.length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(/edit template/i)).not.toBeInTheDocument();
  });

  it('progress bar shows 3 steps on "Customize" path', () => {
    render(<CreateTemplateWizard />);
    fireEvent.click(screen.getByRole('button', { name: /customize/i }));

    expect(screen.getByText(/edit template/i)).toBeInTheDocument();
  });

  it('Back from editor resets to gallery and collapses to 2-step bar', () => {
    render(<CreateTemplateWizard />);
    fireEvent.click(screen.getByRole('button', { name: /customize/i }));

    expect(screen.getByTestId('editor-step')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    expect(screen.getByTestId('source-step')).toBeInTheDocument();
    expect(screen.queryByText(/edit template/i)).not.toBeInTheDocument();
  });
});
