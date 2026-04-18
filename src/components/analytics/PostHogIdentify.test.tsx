import { render } from '@testing-library/react';
import posthog from 'posthog-js';
import { vi } from 'vitest';

import { PostHogIdentify } from './PostHogIdentify';

vi.mock('posthog-js', () => ({
  default: { identify: vi.fn() },
}));

const mockUseUser = vi.fn();
vi.mock('@clerk/nextjs', () => ({
  useUser: () => mockUseUser(),
}));

const mockUser = {
  id: 'clerk_123',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
  fullName: 'Test User',
};

describe('PostHogIdentify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls posthog.identify with Clerk user ID and email when user is loaded', () => {
    mockUseUser.mockReturnValue({ isLoaded: true, user: mockUser });

    render(<PostHogIdentify />);

    expect(posthog.identify).toHaveBeenCalledWith('clerk_123', {
      email: 'test@example.com',
      name: 'Test User',
    });
  });

  it('does not call posthog.identify when not yet loaded', () => {
    mockUseUser.mockReturnValue({ isLoaded: false, user: null });

    render(<PostHogIdentify />);

    expect(posthog.identify).not.toHaveBeenCalled();
  });

  it('does not call posthog.identify when user is null', () => {
    mockUseUser.mockReturnValue({ isLoaded: true, user: null });

    render(<PostHogIdentify />);

    expect(posthog.identify).not.toHaveBeenCalled();
  });

  it('re-identifies when user.id changes', () => {
    const { rerender } = render(<PostHogIdentify />);

    mockUseUser.mockReturnValue({ isLoaded: true, user: mockUser });
    rerender(<PostHogIdentify />);

    mockUseUser.mockReturnValue({
      isLoaded: true,
      user: { ...mockUser, id: 'clerk_456', emailAddresses: [{ emailAddress: 'other@example.com' }], fullName: 'Other User' },
    });
    rerender(<PostHogIdentify />);

    expect(posthog.identify).toHaveBeenCalledTimes(2);
    expect(posthog.identify).toHaveBeenLastCalledWith('clerk_456', {
      email: 'other@example.com',
      name: 'Other User',
    });
  });
});
