import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';

import { OtpInput } from '../../features/auth/components/otp-input';
import { useMfaVerify, useMfaSetup } from '../../features/auth/hooks/use-mfa';
import { authStateAtom } from '../../features/auth/model/auth-store';

interface MfaSetupFormData {
  code: string;
}

interface LocationState {
  email?: string;
  accessToken?: string;
}

type SetupPhase = 'code-entry' | 'recovery-codes';

/**
 * MFA セットアップページ
 * ユーザーが OTP コードを入力し、リカバリーコードを表示する
 */
export function MfaSetupPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const authState = useAtomValue(authStateAtom);
  const setAuthState = useSetAtom(authStateAtom);
  const { mfaVerifyMutation } = useMfaVerify();
  const { mfaSetupMutation } = useMfaSetup();
  const { register, handleSubmit, formState: { errors } } = useForm<MfaSetupFormData>({
    mode: 'onBlur'
  });

  const [phase, setPhase] = useState<SetupPhase>('code-entry');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [setupPath, setSetupPath] = useState<'challenge' | 'force-setup'>('challenge');

  // 初期化：セットアップパスを判定
  useEffect(() => {
    const state = location.state as LocationState | null;

    // チャレンジパス：ペンディング中の MFA チャレンジがある場合
    if (authState.pendingMfaChallenge) {
      setSetupPath('challenge');
      return;
    }

    // 強制セットアップパス：アクセストークンとメールがある場合（サインイン後の強制セットアップ）
    if (state?.accessToken && state?.email) {
      setSetupPath('force-setup');
      return;
    }

    // どちらでもない場合はサインインページにリダイレクト
    navigate('/signin');
  }, [authState.pendingMfaChallenge, location.state, navigate]);

  const onSubmitChallenge = async (data: MfaSetupFormData) => {
    if (!authState.pendingMfaChallenge) {
      return;
    }

    await mfaVerifyMutation.mutateAsync({
      email: authState.pendingMfaChallenge.email,
      session: authState.pendingMfaChallenge.session,
      code: data.code
    });

    if (mfaVerifyMutation.isSuccess && mfaVerifyMutation.data?.recoveryCodes) {
      setRecoveryCodes(mfaVerifyMutation.data.recoveryCodes);
      setPhase('recovery-codes');
    }
  };

  const onSubmitForceSetup = async () => {
    const state = location.state as LocationState | null;
    if (!state?.accessToken || !state?.email) {
      return;
    }

    await mfaSetupMutation.mutateAsync({
      email: state.email,
      accessToken: state.accessToken
    });

    if (mfaSetupMutation.isSuccess && mfaSetupMutation.data?.recoveryCodes) {
      setRecoveryCodes(mfaSetupMutation.data.recoveryCodes);
      setPhase('recovery-codes');
    }
  };

  const handleRecoveryCodesSaved = () => {
    // 認証状態をクリア
    setAuthState((prev) => ({
      ...prev,
      pendingMfaChallenge: null,
      requiresMfaSetup: false
    }));
    navigate('/dashboard');
  };

  // コード入力フェーズ
  if (phase === 'code-entry') {
    const isLoading = setupPath === 'challenge' ? mfaVerifyMutation.isPending : mfaSetupMutation.isPending;
    const error = setupPath === 'challenge' ? mfaVerifyMutation.error : mfaSetupMutation.error;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            2 要素認証を有効化
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            メールアドレスに送信された 6 桁のコードを入力してください
          </p>

          <form
            onSubmit={handleSubmit(
              setupPath === 'challenge' ? onSubmitChallenge : onSubmitForceSetup
            )}
            className="space-y-4"
          >
            <OtpInput
              label="認証コード"
              error={errors.code?.message}
              {...register('code', {
                required: '認証コードを入力してください',
                pattern: {
                  value: /^\d{6}$/,
                  message: '6 桁の数字を入力してください'
                }
              })}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-700">
                  {error.message}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              {isLoading ? '検証中...' : '確認'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // リカバリーコード表示フェーズ
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          リカバリーコード
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          これらのコードを安全な場所に保管してください。
          認証デバイスにアクセスできなくなった場合に使用できます。
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6 max-h-48 overflow-y-auto">
          <div className="space-y-2">
            {recoveryCodes.map((code, index) => (
              <div key={index} className="font-mono text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                {code}
              </div>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 mb-6">
          <input type="checkbox" required className="w-4 h-4" />
          <span className="text-sm text-gray-700">
            リカバリーコードを保管しました
          </span>
        </label>

        <button
          onClick={handleRecoveryCodesSaved}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          完了してダッシュボードへ
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          リカバリーコードは二度と表示されません
        </p>
      </div>
    </div>
  );
}
