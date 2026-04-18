import { act, render } from '@testing-library/react';
import { vi } from 'vitest';

// --- Hoist mock variables so they're available inside vi.mock factories ---

const { mockUseUser, mockFetchTemplates, mockTrackEvent } = vi.hoisted(() => ({
  mockUseUser: vi.fn(),
  mockFetchTemplates: vi.fn(),
  mockTrackEvent: vi.fn(),
}));

// --- Mocks ---

vi.mock('@clerk/nextjs', () => ({
  useUser: () => mockUseUser(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock('@/libs/actions/templates', () => ({
  fetchTemplates: (...args: unknown[]) => mockFetchTemplates(...args),
  deleteTemplate: vi.fn(),
}));

vi.mock('@/libs/analytics/trackEvent', () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

vi.mock('@/libs/store/TemplateStore', () => ({
  useTemplateStore: () => ({ selectTemplate: vi.fn() }),
}));

// stub heavy UI components so render doesn't break
vi.mock('@/components/ui/data-table', () => ({
  DataTable: () => null,
}));
vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => null,
}));
vi.mock('./FtuxWelcome', () => ({
  FtuxWelcome: () => null,
}));
vi.mock('../../components/AsyncActionButton', () => ({
  default: () => null,
}));

// Import after mocks are set up
const { default: TemplateTable } = await import('./TemplateTable');

const mockUser = {
  id: 'clerk_123',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
};

const mockTemplate = {
  templateId: 'tpl_1',
  templateName: 'My Template',
  description: '',
  createdAt: new Date().toISOString(),
  previewURL: null,
  environment: 'dev',
  templateType: 'HANDLEBARS',
};

describe('TemplateTable — analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ isLoaded: true, user: mockUser });
  });

  it('fires dashboard_viewed with Clerk user ID (not email) on first load with templates', async () => {
    mockFetchTemplates.mockResolvedValue({ data: [mockTemplate], totalPages: 1 });

    await act(async () => {
      render(<TemplateTable />);
    });

    expect(mockTrackEvent).toHaveBeenCalledWith('dashboard_viewed', {
      user_id: 'clerk_123',
      first_time: false,
    });
  });

  it('fires dashboard_viewed with first_time=true when no templates exist', async () => {
    mockFetchTemplates.mockResolvedValue({ data: [], totalPages: 0 });

    await act(async () => {
      render(<TemplateTable />);
    });

    expect(mockTrackEvent).toHaveBeenCalledWith('dashboard_viewed', {
      user_id: 'clerk_123',
      first_time: true,
    });
  });

  it('fires dashboard_ftux_shown with Clerk user ID when no templates exist', async () => {
    mockFetchTemplates.mockResolvedValue({ data: [], totalPages: 0 });

    await act(async () => {
      render(<TemplateTable />);
    });

    expect(mockTrackEvent).toHaveBeenCalledWith('dashboard_ftux_shown', {
      user_id: 'clerk_123',
    });
  });

  it('does not fire dashboard_viewed when user is null', async () => {
    mockUseUser.mockReturnValue({ isLoaded: true, user: null });
    mockFetchTemplates.mockResolvedValue({ data: [mockTemplate], totalPages: 1 });

    await act(async () => {
      render(<TemplateTable />);
    });

    expect(mockTrackEvent).not.toHaveBeenCalledWith('dashboard_viewed', expect.anything());
  });

  it('does not fire dashboard_viewed on page > 1 (only fires once on initial render)', async () => {
    mockFetchTemplates.mockResolvedValue({ data: [mockTemplate], totalPages: 3 });

    await act(async () => {
      render(<TemplateTable />);
    });

    const calls = mockTrackEvent.mock.calls.filter((args: unknown[]) => args[0] === 'dashboard_viewed');

    expect(calls).toHaveLength(1);
  });
});
