import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { PlanContactDialog } from './PlanContactDialog';
import type { PricingPlan } from './PricingCard';

vi.mock('templify.constants', () => ({
  SUPPORT_EMAIL: 'support@templify.cloud',
}));

const starterPlan: PricingPlan = {
  id: 'starter',
  name: 'Starter',
  price: 15,
  icon: null,
  isPopular: true,
  cta: 'Choose Starter',
  href: 'mailto:support@templify.cloud',
  description: 'For small teams.',
  features: [
    { text: '500 credits/month.' },
    { text: '$5 per additional 250 credits.' },
    { text: 'Email support.' },
  ],
};

describe('PlanContactDialog', () => {
  it('renders nothing when open is false', () => {
    render(<PlanContactDialog plan={starterPlan} open={false} onClose={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows plan name and price when open', () => {
    render(<PlanContactDialog plan={starterPlan} open onClose={vi.fn()} />);

    expect(screen.getByText('Starter Plan')).toBeInTheDocument();
    expect(screen.getByRole('heading')).toHaveTextContent('$15');
  });

  it('renders a mailto href with the plan name pre-filled', () => {
    render(<PlanContactDialog plan={starterPlan} open onClose={vi.fn()} />);

    const emailLink = screen.getByRole('link', { name: /send us an email/i });

    expect(emailLink).toHaveAttribute('href', expect.stringContaining('mailto:'));
    expect(emailLink).toHaveAttribute('href', expect.stringContaining('Starter'));
  });

  it('calls onClose when Maybe later is clicked', async () => {
    const onClose = vi.fn();
    render(<PlanContactDialog plan={starterPlan} open onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: /maybe later/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the close icon button is clicked', async () => {
    const onClose = vi.fn();
    render(<PlanContactDialog plan={starterPlan} open onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders all plan features in the dialog', () => {
    render(<PlanContactDialog plan={starterPlan} open onClose={vi.fn()} />);

    expect(screen.getByText('500 credits/month.')).toBeInTheDocument();
    expect(screen.getByText('$5 per additional 250 credits.')).toBeInTheDocument();
    expect(screen.getByText('Email support.')).toBeInTheDocument();
  });
});
