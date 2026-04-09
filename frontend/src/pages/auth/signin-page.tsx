import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';

import { SigninForm } from '../../features/auth/components/signin-form';
import { useSignin } from '../../features/auth/hooks/use-signin';
import { authStateAtom } from '../../features/auth/model/auth-store';
import { type SigninRequest } from '../../features/auth/types/auth.types';

/**
 * サインインページコンポーネント
 * @returns JSX.Element
 */
export default function SigninPage(): JSX.Element {
  const navigate = useNavigate();
  const authState = useAtomValue(authStateAtom);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [signinEmail, setSigninEmail] = useState<string>('');
  const { signinMutation } = useSignin();

  // MFA チャレンジまたはセットアップフラグが設定された場合に遷移
  useEffect(() => {
    if (authState.pendingMfaChallenge) {
      // MFA チャレンジ応答ページへ遷移
      navigate('/mfa-verify');
    } else if (authState.requiresMfaSetup && signinEmail) {
      // MFA セットアップページへ遷移（アクセストークンとメールを state で渡す）
      navigate('/mfa-setup', {
        state: {
          email: signinEmail,
          accessToken: authState.accessToken
        }
      });
    }
  }, [authState.pendingMfaChallenge, authState.requiresMfaSetup, authState.accessToken, signinEmail, navigate]);

  const onSubmit = async (payload: SigninRequest): Promise<void> => {
    setError(null);
    setSuccessMessage(null);
    setSigninEmail(payload.email);

    try {
      await signinMutation.mutateAsync(payload);
      // MFA チャレンジまたはセットアップフラグが無い場合のみ、useEffect で遷移
      // pendingMfaChallenge や requiresMfaSetup が設定されていない場合はダッシュボードへ
      if (!authState.pendingMfaChallenge && !authState.requiresMfaSetup) {
        setSuccessMessage('Signin successful. Redirecting to dashboard...');
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signin failed';
      setError(message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>

        {error ? (
          <div className="text-sm text-red-700 bg-red-100 p-3 rounded mb-4">{error}</div>
        ) : null}

        {successMessage ? (
          <div className="text-sm text-emerald-700 bg-emerald-100 p-3 rounded mb-4">{successMessage}</div>
        ) : null}

        <SigninForm
          onSubmit={onSubmit}
          isLoading={signinMutation.isPending}
          errorMessage={error}
        />

        <div className="mt-4 text-sm text-slate-600">
          <span>No account yet? </span>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="ml-1 text-blue-600 hover:underline"
          >
            Sign up
          </button>
        </div>
      </div>
    </main>
  );
}
