import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';

import { OtpInput } from '../../features/auth/components/otp-input';
import { useMfaVerify } from '../../features/auth/hooks/use-mfa';
import { authStateAtom } from '../../features/auth/model/auth-store';

interface MfaVerifyFormData {
  code: string;
}

/**
 * MFA チャレンジ応答ページ
 * ユーザーが受け取った OTP コードを入力して、MFA チャレンジに応答する
 */
export function MfaVerifyPage(): JSX.Element {
  const navigate = useNavigate();
  const authState = useAtomValue(authStateAtom);
  const { mfaVerifyMutation } = useMfaVerify();
  const { register, handleSubmit, formState: { errors } } = useForm<MfaVerifyFormData>({
    mode: 'onBlur'
  });

  // ペンディング中の MFA チャレンジがない場合はサインインページにリダイレクト
  if (!authState.pendingMfaChallenge) {
    navigate('/signin');
    return <></>;
  }

  const onSubmit = async (data: MfaVerifyFormData) => {
    if (!authState.pendingMfaChallenge) {
      return;
    }

    await mfaVerifyMutation.mutateAsync({
      email: authState.pendingMfaChallenge.email,
      session: authState.pendingMfaChallenge.session,
      code: data.code
    });

    if (mfaVerifyMutation.isSuccess) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          認証コード入力
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          メールアドレスに送信された 6 桁のコードを入力してください
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          {mfaVerifyMutation.error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-700">
                {mfaVerifyMutation.error.message}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={mfaVerifyMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            {mfaVerifyMutation.isPending ? '検証中...' : '確認'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          セッションは 3 分で期限切れになります
        </p>
      </div>
    </div>
  );
}
