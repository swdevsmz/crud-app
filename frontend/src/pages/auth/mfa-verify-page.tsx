import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';

import { useSignin } from '../../features/auth/hooks/use-signin';
import { authStateAtom } from '../../features/auth/model/auth-store';
import { FormField } from '../../shared/ui/form-field';

interface MfaFormValues {
  code: string;
}

interface MfaLocationState {
  email: string;
  session: string;
}

export default function MfaVerifyPage(): JSX.Element {
  const navigate = useNavigate();
  const { state } = useLocation();
  const setAuthState = useSetAtom(authStateAtom);
  const [error, setError] = useState<string | null>(null);
  const { mfaVerifyMutation } = useSignin();

  const locationState = state as MfaLocationState | null;
  const email = locationState?.email ?? '';
  const session = locationState?.session ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting }
  } = useForm<MfaFormValues>({
    mode: 'onChange',
    defaultValues: { code: '' }
  });

  const canSubmit = isValid && !isSubmitting && !mfaVerifyMutation.isPending && Boolean(email) && Boolean(session);

  const onSubmit = async ({ code }: MfaFormValues): Promise<void> => {
    setError(null);
    if (!email || !session) {
      setError('Session expired. Please sign in again.');
      return;
    }

    try {
      const response = await mfaVerifyMutation.mutateAsync({ email, session, code });

      if (response.tokens) {
        setAuthState({
          accessToken: response.tokens.accessToken,
          idToken: response.tokens.idToken,
          refreshToken: response.tokens.refreshToken ?? null,
          expiresAt: response.tokens.expiresIn
            ? Date.now() + response.tokens.expiresIn * 1000
            : null,
          isAuthenticated: true
        });
      }

      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    }
  };

  if (!email || !session) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white shadow-sm rounded-lg p-6">
          <p className="text-slate-600">Session expired. Please{' '}
            <button type="button" onClick={() => navigate('/signin')} className="text-blue-600 hover:underline">
              sign in again
            </button>.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-2">Two-factor authentication</h1>
        <p className="text-sm text-slate-600 mb-6">
          A verification code was sent to <span className="font-medium">{email}</span>.
          Please enter it below.
        </p>

        {error ? (
          <div className="text-sm text-red-700 bg-red-100 p-3 rounded mb-4">{error}</div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField id="code" label="Verification code" error={errors.code?.message}>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest text-center text-lg"
              {...register('code', {
                required: 'Please enter the verification code.',
                validate: (value) => value.trim().length > 0 || 'Please enter the verification code.'
              })}
            />
          </FormField>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting || mfaVerifyMutation.isPending ? 'Verifying…' : 'Verify'}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          <button
            type="button"
            onClick={() => navigate('/signin')}
            className="text-blue-600 hover:underline"
          >
            Back to sign in
          </button>
        </div>
      </div>
    </main>
  );
}
