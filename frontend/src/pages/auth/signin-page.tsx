import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { PasswordInput } from '../../features/auth/components/password-input';
import { useSignin } from '../../features/auth/hooks/use-signin';
import { type SigninRequest } from '../../features/auth/types/auth.types';
import { isValidEmail } from '../../shared/lib/validation';
import { FormField } from '../../shared/ui/form-field';

export default function SigninPage(): JSX.Element {
  const navigate = useNavigate();
  // サーバーまたはバリデーション由来のエラーメッセージ
  const [error, setError] = useState<string | null>(null);
  const { signinMutation } = useSignin();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting }
  } = useForm<SigninRequest>({
    // onChange モードで入力のたびにバリデーションを実行
    mode: 'onChange',
    defaultValues: { email: '', password: '' }
  });

  // 全バリデーションが通っており、送信・API通信中でなければ送信可能
  const canSubmit = isValid && !isSubmitting && !signinMutation.isPending;

  const onSubmit = async (payload: SigninRequest): Promise<void> => {
    setError(null);
    try {
      const response = await signinMutation.mutateAsync(payload);

      if (response.mfaRequired && response.session) {
        // MFAチャレンジが必要な場合はMFA確認ページへ遷移
        navigate('/mfa-verify', {
          state: {
            email: response.email ?? payload.email,
            session: response.session
          }
        });
        return;
      }

      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-6">Sign in</h1>

        {error ? (
          <div className="text-sm text-red-700 bg-red-100 p-3 rounded mb-4">{error}</div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField id="email" label="Email" error={errors.email?.message}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('email', {
                required: 'Please enter your email address.',
                validate: (value) => isValidEmail(value) || 'Please enter a valid email address.'
              })}
            />
          </FormField>

          <PasswordInput
            id="password"
            label="Password"
            autoComplete="current-password"
            error={errors.password?.message}
            register={register('password', {
              required: 'Please enter your password.'
            })}
          />

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-2 w-full rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting || signinMutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="text-blue-600 hover:underline"
          >
            Sign up
          </button>
        </div>
      </div>
    </main>
  );
}
