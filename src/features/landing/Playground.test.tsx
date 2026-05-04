import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTemplateStore } from '@/libs/store/TemplateStore';

import Playground from './Playground';

// --- Hoisted mock functions ---
const { mockFetchTemplates, mockTrackEvent, mockRenderTemplate, mockOpenSignUp }
  = vi.hoisted(() => ({
    mockFetchTemplates: vi.fn(),
    mockTrackEvent: vi.fn(),
    mockRenderTemplate: vi.fn(),
    mockOpenSignUp: vi.fn(),
  }));

vi.mock('@/libs/actions/templates', () => ({
  fetchTemplatesFromGallery: mockFetchTemplates,
}));

vi.mock('@/libs/analytics/trackEvent', () => ({
  trackEvent: mockTrackEvent,
}));

vi.mock('@/libs/services/HandlebarService', () => ({
  HandlebarsService: vi.fn().mockImplementation(() => ({
    renderTemplate: mockRenderTemplate,
  })),
}));

vi.mock('@clerk/nextjs', () => ({
  useClerk: () => ({ openSignUp: mockOpenSignUp }),
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock('@/components/template/handlebars-editor/JsonEditor', () => ({
  JsonEditor: ({ onChange }: { onChange: (v: string) => void }) => (
    <textarea data-testid="json-editor" onChange={e => onChange(e.target.value)} />
  ),
}));

vi.mock('@/components/template/handlebars-editor/PreviewPanel', () => ({
  PreviewPanel: ({ preview }: { preview: string }) => (
    <div data-testid="preview-panel">{preview}</div>
  ),
}));

// Prevent jsdom navigation errors triggered by anchor.click() in the download handler
const anchorClickMock = vi.fn();
Object.defineProperty(HTMLAnchorElement.prototype, 'click', {
  value: anchorClickMock,
  writable: true,
  configurable: true,
});

// IntersectionObserver is not available in jsdom
let capturedIntersectionCallback:
  | ((entries: Partial<IntersectionObserverEntry>[]) => void)
  | null = null;

globalThis.IntersectionObserver = vi.fn((cb) => {
  capturedIntersectionCallback = cb;
  return { observe: vi.fn(), disconnect: vi.fn(), unobserve: vi.fn() };
}) as unknown as typeof IntersectionObserver;

globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
globalThis.URL.revokeObjectURL = vi.fn();

const TEMPLATE_DATA = [
  {
    id: 'tpl-invoice-1',
    title: 'Invoice',
    description: 'Invoice template',
    category: 'Finance',
    icon: 'FileText',
    color: 'text-blue-600',
    htmlContent: '<p>invoice</p>',
    handlebarContent: '<p>{{name}}</p>',
    sampleData: { name: 'Acme Corp' },
    style: null,
    previewHtmlContent: null,
    typeKey: 'invoice',
    variantName: null,
  },
  {
    id: 'tpl-resume-1',
    title: 'Resume',
    description: 'Resume template',
    category: 'HR',
    icon: 'User',
    color: 'text-green-600',
    htmlContent: '<p>resume</p>',
    handlebarContent: '<p>{{position}}</p>',
    sampleData: { position: 'Engineer' },
    style: null,
    previewHtmlContent: null,
    typeKey: 'resume',
    variantName: null,
  },
];

describe('Playground', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedIntersectionCallback = null;
    useTemplateStore.getState().resetTemplate();
    useTemplateStore.setState({ templateGallery: null });
    mockFetchTemplates.mockResolvedValue(TEMPLATE_DATA);
    mockRenderTemplate.mockResolvedValue('<p>rendered HTML</p>');
  });

  it('renders a pill button for each loaded template group', async () => {
    render(<Playground />);

    expect(await screen.findByRole('button', { name: 'Invoice' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();
  });

  it('auto-selects the first template on mount without firing playground_template_switched', async () => {
    render(<Playground />);

    await screen.findByRole('button', { name: 'Invoice' });

    const switchCalls = mockTrackEvent.mock.calls.filter(
      ([e]) => e === 'playground_template_switched',
    );

    expect(switchCalls).toHaveLength(0);
    expect(useTemplateStore.getState().templateName).toBe('Invoice');
  });

  it('fires playground_section_viewed when the section enters the viewport', async () => {
    render(<Playground />);
    await screen.findByRole('button', { name: 'Invoice' });

    act(() => capturedIntersectionCallback?.([{ isIntersecting: true }]));

    expect(mockTrackEvent).toHaveBeenCalledWith('playground_section_viewed', {
      device_type: expect.any(String),
    });
  });

  it('does not fire playground_section_viewed when section is not intersecting', async () => {
    render(<Playground />);
    await screen.findByRole('button', { name: 'Invoice' });

    act(() => capturedIntersectionCallback?.([{ isIntersecting: false }]));

    const viewedCalls = mockTrackEvent.mock.calls.filter(
      ([e]) => e === 'playground_section_viewed',
    );

    expect(viewedCalls).toHaveLength(0);
  });

  it('fires playground_template_switched with from/to names when user clicks a pill', async () => {
    render(<Playground />);
    await screen.findByRole('button', { name: 'Resume' });

    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));

    expect(mockTrackEvent).toHaveBeenCalledWith('playground_template_switched', {
      template_name: 'Resume',
      gallery_template_id: 'tpl-resume-1',
      from_template_name: 'Invoice',
    });

    // Drain the async render triggered by the template switch before the test ends
    await waitFor(() => expect(mockRenderTemplate).toHaveBeenCalledTimes(2));
  });

  it('fires playground_preview_rendered with timing on the first successful render', async () => {
    render(<Playground />);

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith(
        'playground_preview_rendered',
        expect.objectContaining({
          template_name: 'Invoice',
          gallery_template_id: 'tpl-invoice-1',
          render_time_ms: expect.any(Number),
        }),
      );
    });
  });

  it('does not fire playground_preview_rendered on subsequent renders of the same template', async () => {
    render(<Playground />);
    await waitFor(() => expect(mockRenderTemplate).toHaveBeenCalledTimes(1));

    // Trigger a second render by editing the JSON data
    fireEvent.click(screen.getByRole('button', { name: /customize sample data/i }));
    fireEvent.change(screen.getByTestId('json-editor'), {
      target: { value: '{"name":"Updated"}' },
    });

    await waitFor(() => expect(mockRenderTemplate).toHaveBeenCalledTimes(2));

    const renderedEvents = mockTrackEvent.mock.calls.filter(
      ([e]) => e === 'playground_preview_rendered',
    );

    expect(renderedEvents).toHaveLength(1);
  });

  it('fires playground_data_editor_opened when expanding the editor panel', async () => {
    render(<Playground />);
    await screen.findByRole('button', { name: 'Invoice' });

    fireEvent.click(screen.getByRole('button', { name: /customize sample data/i }));

    expect(mockTrackEvent).toHaveBeenCalledWith('playground_data_editor_opened', {
      template_name: 'Invoice',
    });
  });

  it('does not fire playground_data_editor_opened when collapsing the editor', async () => {
    render(<Playground />);
    await screen.findByRole('button', { name: 'Invoice' });

    const toggle = screen.getByRole('button', { name: /customize sample data/i });
    fireEvent.click(toggle); // open
    fireEvent.click(toggle); // close

    const openedCalls = mockTrackEvent.mock.calls.filter(
      ([e]) => e === 'playground_data_editor_opened',
    );

    expect(openedCalls).toHaveLength(1);
  });

  it('fires playground_signup_cta_clicked with had_customized_data:false before any JSON edits', async () => {
    render(<Playground />);
    await screen.findByRole('button', { name: 'Invoice' });

    fireEvent.click(screen.getByRole('button', { name: /start free/i }));

    expect(mockTrackEvent).toHaveBeenCalledWith('playground_signup_cta_clicked', {
      template_name: 'Invoice',
      gallery_template_id: 'tpl-invoice-1',
      had_customized_data: false,
    });
    expect(mockOpenSignUp).toHaveBeenCalledWith({ afterSignUpUrl: '/dashboard' });
  });

  it('fires playground_signup_cta_clicked with had_customized_data:true after editing JSON', async () => {
    render(<Playground />);
    await screen.findByRole('button', { name: 'Invoice' });

    fireEvent.click(screen.getByRole('button', { name: /customize sample data/i }));
    fireEvent.change(screen.getByTestId('json-editor'), {
      target: { value: '{"name":"Custom"}' },
    });
    // Drain the re-render triggered by the JSON change before asserting
    await waitFor(() => expect(mockRenderTemplate).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByRole('button', { name: /start free/i }));

    expect(mockTrackEvent).toHaveBeenCalledWith(
      'playground_signup_cta_clicked',
      expect.objectContaining({ had_customized_data: true }),
    );
  });

  it('fires playground_pdf_downloaded on a successful download', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(new Blob(['pdf-content'], { type: 'application/pdf' }), { status: 200 }),
    );

    render(<Playground />);
    await screen.findByRole('button', { name: 'Invoice' });

    fireEvent.click(screen.getByRole('button', { name: /download this pdf/i }));

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith('playground_pdf_downloaded', {
        gallery_template_id: 'tpl-invoice-1',
        template_name: 'Invoice',
      });
    });
  });

  it('fires playground_pdf_download_failed with rate_limited on a 429 response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429 }),
    );

    render(<Playground />);
    await screen.findByRole('button', { name: 'Invoice' });

    fireEvent.click(screen.getByRole('button', { name: /download this pdf/i }));

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith('playground_pdf_download_failed', {
        gallery_template_id: 'tpl-invoice-1',
        template_name: 'Invoice',
        error_code: 'rate_limited',
      });
    });
  });

  it('fires playground_pdf_download_failed with service_unavailable on a 503 response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Service unavailable' }), { status: 503 }),
    );

    render(<Playground />);
    await screen.findByRole('button', { name: 'Invoice' });

    fireEvent.click(screen.getByRole('button', { name: /download this pdf/i }));

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith(
        'playground_pdf_download_failed',
        expect.objectContaining({ error_code: 'service_unavailable' }),
      );
    });
  });

  it('fires playground_pdf_download_failed with unknown for unexpected error statuses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 }),
    );

    render(<Playground />);
    await screen.findByRole('button', { name: 'Invoice' });

    fireEvent.click(screen.getByRole('button', { name: /download this pdf/i }));

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith(
        'playground_pdf_download_failed',
        expect.objectContaining({ error_code: 'unknown' }),
      );
    });
  });
});
