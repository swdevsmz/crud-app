import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import SignupPage from './signup-page';

function renderSignupPage(): void {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify" element={<div>Verify Route Reached</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('SignupPage', () => {
  it('submits valid values and navigates to verify page', async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password1!');
    await user.type(screen.getByLabelText('Confirm password'), 'Password1!');
    await user.click(screen.getByRole('button', { name: 'Sign up' }));

    await waitFor(() => {
      expect(screen.getByText('Verify Route Reached')).toBeInTheDocument();
    });
  });
});
