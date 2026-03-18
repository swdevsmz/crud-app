import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import VerifyPage from './verify-page';

function renderVerifyPage(): void {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/verify?email=user@example.com']}>
        <Routes>
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/dashboard" element={<div>Dashboard Reached</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('VerifyPage', () => {
  it('submits valid values and navigates to dashboard', async () => {
    const user = userEvent.setup();
    renderVerifyPage();

    await user.type(screen.getByLabelText('Verification code'), '123456');
    await user.type(screen.getByLabelText('Password'), 'Password1!');
    await user.click(screen.getByRole('button', { name: 'Verify and sign in' }));

    await waitFor(
      () => {
        expect(screen.getByText('Dashboard Reached')).toBeInTheDocument();
      },
      { timeout: 2500 }
    );
  });
});
