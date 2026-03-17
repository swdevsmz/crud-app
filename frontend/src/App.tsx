import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import SignupPage from './components/auth/signup-page';
import VerifyPage from './components/auth/verify-page';

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/dashboard" element={<div className="p-6">Dashboard (placeholder)</div>} />
      </Routes>
    </BrowserRouter>
  );
}
