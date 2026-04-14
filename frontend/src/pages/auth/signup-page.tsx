import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SignupForm } from '../../features/auth/components/signup-form';
import { useSignup } from '../../features/auth/hooks/use-signup';
import { type SignupRequest } from '../../features/auth/types/auth.types';
import { VerificationSuccess } from '../../features/auth/components/verification-success';

/**
 * 新規登録ページコンポーネント
 * 
 * @returns JSX.Element
 */
export default function SignupPage(): JSX.Element {
  
  // React Routerのナビゲーションフック
  const navigate = useNavigate();

  // 画面内表示用のエラー/成功メッセージ
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // サインアップとメール検証のロジックを提供するカスタムフック
  const { signupMutation } = useSignup();

  const onSubmit = async (payload: SignupRequest): Promise<void> => {
    
    // 再送信時に前回メッセージをクリア
    setError(null);
    setSuccessMessage(null);

    try {
      // サインアップAPIを実行し、成功時は検証画面へ遷移する
      await signupMutation.mutateAsync(payload);
      const message = 'Signup succeeded! Check your email for a verification code.';
      setSuccessMessage(message);
     
      // メールアドレスはクエリに載せるためURLエンコードする
      navigate(`/verify?email=${encodeURIComponent(payload.email)}`, {
        state: { signupSuccessMessage: message }
      });
      
    } catch (err: unknown) {
      // APIエラーはユーザー表示用メッセージへ変換して保持する
      const message = err instanceof Error ? err.message : '登録に失敗しました。';
      setError(message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">Sign up</h1>

        {/* サーバーまたはバリデーション由来のエラー表示 */}
        {error ? (
          <div className="text-sm text-red-700 bg-red-100 p-3 rounded mb-4">{error}</div>
        ) : null}

        {/* サインアップ成功時の案内表示 */}
        {successMessage ? (
          <VerificationSuccess message={successMessage} />
        ) : null}

        <SignupForm
          onSubmit={onSubmit}
          isLoading={signupMutation.isPending}
          errorMessage={error}
        />

        <div className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/signin')}
            className="text-blue-600 hover:underline"
          >
            Sign in
          </button>
        </div>
      </div>
    </main>
  );
}
