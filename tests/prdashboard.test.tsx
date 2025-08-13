import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PRDashboard from '@/components/PRDashboard';

jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) },
    from: () => ({ select: () => ({ single: async () => ({ data: null }) }) })
  })
}));

describe('PRDashboard', () => {
  it('renders inputs and save button', async () => {
    render(<PRDashboard />);
    expect(screen.getByLabelText(/bench/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/squat/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/deadlift/i)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /save/i })).toBeInTheDocument();
  });
});


