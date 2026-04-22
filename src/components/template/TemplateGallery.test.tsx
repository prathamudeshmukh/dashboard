import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTemplateStore } from '@/libs/store/TemplateStore';

import TemplateGallery from './TemplateGallery';

vi.mock('@/libs/actions/templates', () => ({
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
      sampleData: { name: 'Acme' },
    },
    {
      id: 'tpl-2',
      title: 'Resume',
      description: 'A resume template',
      category: 'HR',
      icon: 'User',
      color: '#111',
      htmlContent: '<p>resume</p>',
      handlebarContent: '{{position}}',
      sampleData: { position: 'Engineer' },
    },
  ]),
}));

describe('TemplateGallery', () => {
  const onUseAsIs = vi.fn();
  const onCustomize = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useTemplateStore.getState().resetTemplate();
  });

  function renderGallery() {
    return render(<TemplateGallery onUseAsIs={onUseAsIs} onCustomize={onCustomize} />);
  }

  it('renders Use as-is and Customize buttons for each card', async () => {
    renderGallery();
    const useAsIsButtons = await screen.findAllByRole('button', { name: /use as-is/i });
    const customizeButtons = await screen.findAllByRole('button', { name: /customize/i });

    expect(useAsIsButtons).toHaveLength(2);
    expect(customizeButtons).toHaveLength(2);
  });

  it('populates store and calls onUseAsIs when Use as-is is clicked', async () => {
    renderGallery();
    const [firstUseAsIs] = await screen.findAllByRole('button', { name: /use as-is/i });
    fireEvent.click(firstUseAsIs!);

    expect(onUseAsIs).toHaveBeenCalledTimes(1);
    expect(useTemplateStore.getState().templateName).toBe('Invoice');
    expect(useTemplateStore.getState().htmlContent).toBe('<p>invoice</p>');
  });

  it('populates store and calls onCustomize when Customize is clicked', async () => {
    renderGallery();
    const [firstCustomize] = await screen.findAllByRole('button', { name: /customize/i });
    fireEvent.click(firstCustomize!);

    expect(onCustomize).toHaveBeenCalledTimes(1);
    expect(useTemplateStore.getState().templateName).toBe('Invoice');
  });
});
