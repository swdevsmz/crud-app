import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { useAutoRefresh } from '../features/auth/hooks/use-auto-refresh';
import { ProtectedRoute } from '../shared/components/protected-route';
import SigninPage from '../pages/auth/signin-page';
import SignupPage from '../pages/auth/signup-page';
import VerifyPage from '../pages/auth/verify-page';
import MfaVerifyPage from '../pages/auth/mfa-verify-page';
import DashboardPage from '../pages/dashboard/dashboard-page';

/**
 * アプリ全体のルーティング定義。
 * useAutoRefresh をここで呼ぶことで全ページにトークン自動リフレッシュを適用する。
 */
function AppRoutes(): JSX.Element {
  // アクセストークンの有効期限を監視し、期限切れ前に自動でリフレッシュする
  useAutoRefresh();
  return (
    <Routes>
      {/* ルートへのアクセスはサインインページへリダイレクト */}
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={<SigninPage />} />
      <Route path="/signup" element={<SignupPage />} />
      {/* メール検証コード入力ページ（サインアップ後に遷移） */}
      <Route path="/verify" element={<VerifyPage />} />
      {/* メールOTP（2要素認証）入力ページ */}
      <Route path="/mfa-verify" element={<MfaVerifyPage />} />
      {/* ProtectedRoute で認証済みユーザーのみアクセスを許可 */}
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
