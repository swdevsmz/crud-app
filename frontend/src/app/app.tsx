import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import SigninPage from '../pages/auth/signin-page';
import SignupPage from '../pages/auth/signup-page';
import VerifyPage from '../pages/auth/verify-page';
import { MfaVerifyPage } from '../pages/auth/mfa-verify-page';
import { MfaSetupPage } from '../pages/auth/mfa-setup-page';

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/mfa-verify" element={<MfaVerifyPage />} />
        <Route path="/mfa-setup" element={<MfaSetupPage />} />
        <Route path="/dashboard" element={<div className="p-6">Dashboard (placeholder)</div>} />
      </Routes>
    </BrowserRouter>
  );
}
