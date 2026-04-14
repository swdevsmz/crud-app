import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { useAutoRefresh } from '../features/auth/hooks/use-auto-refresh';
import { ProtectedRoute } from '../shared/components/protected-route';
import SigninPage from '../pages/auth/signin-page';
import SignupPage from '../pages/auth/signup-page';
import VerifyPage from '../pages/auth/verify-page';
import MfaVerifyPage from '../pages/auth/mfa-verify-page';
import DashboardPage from '../pages/dashboard/dashboard-page';

function AppRoutes(): JSX.Element {
  useAutoRefresh();
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={<SigninPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/mfa-verify" element={<MfaVerifyPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
