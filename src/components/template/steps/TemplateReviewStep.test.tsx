import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTemplateStore } from '@/libs/store/TemplateStore';
import { EditorTypeEnum } from '@/types/Enum';

import TemplateReviewStep from './TemplateReviewStep';

vi.mock('@/service/contentGenerator', () => ({
  default: vi.fn().mockResolvedValue('<p>preview</p>'),
}));

describe('TemplateReviewStep', () => {
  beforeEach(() => {
    useTemplateStore.getState().resetTemplate();
  });

  it('pre-populates name and description inputs from the store', () => {
    useTemplateStore.getState().setTemplateName('My Invoice');
    useTemplateStore.getState().setTemplateDescription('An invoice template');
    render(<TemplateReviewStep />);

    expect(screen.getByDisplayValue('My Invoice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('An invoice template')).toBeInTheDocument();
  });

  it('shows name required error on blur when name is empty', () => {
    render(<TemplateReviewStep />);
    const nameInput = screen.getByTestId('review-template-name');
    fireEvent.blur(nameInput);

    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });

  it('shows description required error on blur when description is empty', () => {
    render(<TemplateReviewStep />);
    const descInput = screen.getByTestId('review-template-description');
    fireEvent.blur(descInput);

    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
  });

  it('clears name error when user types into the name field', () => {
    render(<TemplateReviewStep />);
    const nameInput = screen.getByTestId('review-template-name');
    fireEvent.blur(nameInput);

    expect(screen.getByText(/name is required/i)).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: 'New name' } });

    expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
  });

  it('updates store when name input changes', () => {
    useTemplateStore.getState().setTemplateName('Old');
    render(<TemplateReviewStep />);
    const nameInput = screen.getByTestId('review-template-name');
    fireEvent.change(nameInput, { target: { value: 'Updated' } });

    expect(useTemplateStore.getState().templateName).toBe('Updated');
  });

  it('renders handlebars JSON card when in handlebars mode with content', async () => {
    useTemplateStore.setState({
      activeTab: EditorTypeEnum.HANDLEBARS,
      handlebarsCode: '{{name}}',
      handlebarTemplateJson: '{"name":"test"}',
    });
    render(<TemplateReviewStep />);
    await waitFor(() => expect(screen.getByText('JSON')).toBeInTheDocument());
  });
});
