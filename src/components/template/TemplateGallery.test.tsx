import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchTemplatesFromGallery } from '@/libs/actions/templates';
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
      style: null,
      previewHtmlContent: '<html><body><p>Invoice Preview</p></body></html>',
      typeKey: 'invoice-template',
      variantName: null,
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
      style: null,
      previewHtmlContent: null,
      typeKey: 'resume-template',
      variantName: null,
    },
  ]),
}));

const multiVariantMock = [
  {
    id: 'inv-classic',
    title: 'Invoice',
    description: 'An invoice',
    category: 'Finance',
    icon: 'FileText',
    color: '#000',
    htmlContent: '<p>classic</p>',
    handlebarContent: '{{name}}',
    sampleData: null,
    style: null,
    previewHtmlContent: null,
    typeKey: 'invoice-template',
    variantName: 'Classic',
  },
  {
    id: 'inv-modern',
    title: 'Invoice',
    description: 'An invoice',
    category: 'Finance',
    icon: 'FileText',
    color: '#000',
    htmlContent: '<p>modern</p>',
    handlebarContent: '{{name}}',
    sampleData: null,
    style: null,
    previewHtmlContent: null,
    typeKey: 'invoice-template',
    variantName: 'Modern',
  },
];

describe('TemplateGallery', () => {
  const onUseAsIs = vi.fn();
  const onCustomize = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useTemplateStore.getState().resetTemplate();
    useTemplateStore.setState({ templateGallery: null });
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

  it('renders an iframe thumbnail for cards with previewHtmlContent', async () => {
    renderGallery();
    const iframes = await screen.findAllByTestId('template-preview-iframe');

    expect(iframes).toHaveLength(1);
    expect(iframes[0]).toHaveAttribute('sandbox', 'allow-same-origin');
  });

  it('renders a placeholder div for cards with null previewHtmlContent', async () => {
    renderGallery();
    const placeholders = await screen.findAllByTestId('template-preview-placeholder');

    expect(placeholders).toHaveLength(1);
  });

  it('renders one card per distinct typeKey (grouping)', async () => {
    renderGallery();
    const cards = await screen.findAllByTestId('template-card');

    expect(cards).toHaveLength(2);
  });

  it('does not render carousel arrows for single-variant groups', async () => {
    renderGallery();
    await screen.findAllByTestId('template-card');

    expect(screen.queryByTestId('carousel-prev')).not.toBeInTheDocument();
    expect(screen.queryByTestId('carousel-next')).not.toBeInTheDocument();
  });
});

describe('TemplateGallery — multi-variant carousel', () => {
  const onUseAsIs = vi.fn();
  const onCustomize = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useTemplateStore.getState().resetTemplate();
    useTemplateStore.setState({ templateGallery: null });
    vi.mocked(fetchTemplatesFromGallery).mockResolvedValue(multiVariantMock);
  });

  function renderGallery() {
    return render(<TemplateGallery onUseAsIs={onUseAsIs} onCustomize={onCustomize} />);
  }

  it('renders one card for two rows with the same typeKey', async () => {
    renderGallery();
    const cards = await screen.findAllByTestId('template-card');

    expect(cards).toHaveLength(1);
  });

  it('renders carousel arrows when a group has multiple variants', async () => {
    renderGallery();
    await screen.findAllByTestId('template-card');

    expect(screen.getByTestId('carousel-prev')).toBeInTheDocument();
    expect(screen.getByTestId('carousel-next')).toBeInTheDocument();
  });

  it('advances to the next variant on next arrow click and shows its variant name', async () => {
    renderGallery();
    await screen.findAllByTestId('template-card');

    expect(screen.getByText('Classic')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('carousel-next'));

    expect(screen.getByText('Modern')).toBeInTheDocument();
  });

  it('"Use as-is" uses the currently-active variant\'s htmlContent', async () => {
    renderGallery();
    await screen.findAllByTestId('template-card');

    fireEvent.click(screen.getByTestId('carousel-next'));
    fireEvent.click(screen.getByRole('button', { name: /use as-is/i }));

    expect(useTemplateStore.getState().htmlContent).toBe('<p>modern</p>');
  });
});
