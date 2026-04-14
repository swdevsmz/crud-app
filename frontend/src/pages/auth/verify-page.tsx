import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import { PasswordInput } from '../../features/auth/components/password-input';
import { VerificationSuccess } from '../../features/auth/components/verification-success';
import { useSignup } from '../../features/auth/hooks/use-signup';
import { type VerifyEmailRequest } from '../../features/auth/types/auth.types';
import { isValidEmail, isStrongPassword } from '../../shared/lib/validation';
import { FormField } from '../../shared/ui/form-field';

export default function VerifyPage(): JSX.Element {
  const navigate = useNavigate();
  const { search, state } = useLocation();
  // サインアップページからクエリパラメータで渡されたメールアドレスを取得
  const emailFromQuery = new URLSearchParams(search).get('email') ?? '';
  // サインアップページからreact-router stateで渡された成功メッセージを取得
  const signupSuccessMessage =
    typeof state === 'object' && state && 'signupSuccessMessage' in state
      ? String((state as { signupSuccessMessage?: string }).signupSuccessMessage ?? '')
      : '';

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { verifyEmailMutation } = useSignup();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid, isSubmitting },
    watch
  } = useForm<VerifyEmailRequest>({
    mode: 'onChange',
    defaultValues: {
      email: emailFromQuery,
      code: '',
      password: ''
    }
  });

  // クエリパラメータのメールアドレスをフォームにセット（初回マウント時）
  useEffect(() => {
    if (emailFromQuery) {
      setValue('email', emailFromQuery, { shouldValidate: true });
    }
  }, [emailFromQuery, setValue]);

  // サインアップページから引き継いだ成功メッセージを表示
  useEffect(() => {
    if (signupSuccessMessage) {
      setSuccess(signupSuccessMessage);
    }
  }, [signupSuccessMessage]);

  const canSubmit = isValid && !isSubmitting;
  // Back to signup ボタンのリンク生成に使用
  const emailValue = watch('email');

  const onSubmit = async (payload: VerifyEmailRequest): Promise<void> => {
    setError(null);
    setSuccess(null);

    try {
      const response = await verifyEmailMutation.mutateAsync(payload);

      // MFAチャレンジが必要な場合はMFA確認ページへ遷移
      if (response.mfaRequired && response.session) {
        navigate('/mfa-verify', {
          state: {
            email: response.email ?? payload.email,
            session: response.session
          }
        });
        return;
      }

      setSuccess('Email verified successfully! You are now signed in.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">Verify your email</h1>

        {error ? (
          <div className="text-sm text-red-700 bg-red-100 p-3 rounded mb-4">{error}</div>
        ) : null}

        {success ? (
          <VerificationSuccess message={success} />
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField id="email" label="Email" error={errors.email?.message}>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Please enter a valid email address.',
                validate: (value) => isValidEmail(value) || 'Please enter a valid email address.'
              })}
              className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </FormField>

          <FormField id="code" label="Verification code" error={errors.code?.message}>
            <input
              id="code"
              type="text"
              {...register('code', {
                required: 'Please enter the verification code.',
                validate: (value) => value.trim().length > 0 || 'Please enter the verification code.'
              })}
              className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </FormField>

          <PasswordInput
            id="password"
            label="Password"
            autoComplete="current-password"
            error={errors.password?.message}
            register={register('password', {
              required: 'Password must be at least 8 characters and include upper/lower, number, and symbol.',
              validate: (value) =>
                isStrongPassword(value) ||
                'Password must be at least 8 characters and include upper/lower, number, and symbol.'
            })}
          />

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Verifying…' : 'Verify and sign in'}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          <button
            type="button"
            onClick={() => navigate(`/signup?email=${encodeURIComponent(emailValue ?? '')}`)}
            className="text-blue-600 hover:underline"
          >
            Back to signup
          </button>
          .
        </div>
      </div>
    </main>
  );
}
