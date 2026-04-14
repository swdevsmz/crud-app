import { useAtom } from 'jotai';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { authStateAtom } from '../../features/auth/model/auth-store';
import { authService } from '../../features/auth/services/auth-service';

/**
 * IDトークン（JWT）のペイロードからメールアドレスを取得する。
 * JWT はピリオド区切りの3パートで構成され、2パート目がBase64エンコードされたペイロード。
 */
function decodeEmail(idToken: string | null): string | null {
  if (!idToken) return null;
  try {
    const parts = idToken.split('.');
    if (parts.length < 2) return null;
    // Base64URLをBase64に変換してからデコード
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(parts[1].length / 4) * 4, '=');
    const decoded = JSON.parse(atob(payload)) as { email?: string };
    return decoded.email ?? null;
  } catch {
    return null;
  }
}

export default function DashboardPage(): JSX.Element {
  const navigate = useNavigate();
  const [authState, setAuthState] = useAtom(authStateAtom);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // IDトークンからメールアドレスを取得してナビバーに表示する
  const email = decodeEmail(authState.idToken);

  /** 認証状態を初期値にリセットする */
  const clearAuthState = (): void => {
    setAuthState({ accessToken: null, idToken: null, refreshToken: null, expiresAt: null, isAuthenticated: false });
  };

  const handleSignOut = async (): Promise<void> => {
    setIsSigningOut(true);
    if (authState.accessToken) {
      try {
        // Cognito側のすべてのデバイスのトークンを無効化（グローバルサインアウト）
        await authService.signout({ accessToken: authState.accessToken });
      } catch {
        // API 失敗時もローカル状態はクリアして続行
      }
    }
    clearAuthState();
    navigate('/signin');
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-slate-800">Dashboard</span>
        <div className="flex items-center gap-4">
          {email ? (
            <span className="text-sm text-slate-600">{email}</span>
          ) : null}
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={isSigningOut}
            className="text-sm text-red-600 hover:underline disabled:opacity-50"
          >
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-semibold mb-2">Welcome{email ? `, ${email}` : ''}!</h1>
          <p className="text-slate-600">
            You are signed in and viewing a protected page.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-green-600 text-xl">&#10003;</span>
            <div>
              <p className="font-medium text-green-800">Authentication successful</p>
              <p className="text-sm text-green-700 mt-1">
                Your identity was verified with two-factor authentication via email OTP.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
