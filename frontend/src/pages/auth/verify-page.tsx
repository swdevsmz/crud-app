import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import { type VerifyEmailRequest } from '../../features/auth/api/auth';
import { useVerifyEmailMutation } from '../../features/auth/api/hooks';
import { isValidEmail, isStrongPassword } from '../../shared/lib/validation';

export default function VerifyPage(): JSX.Element {
  const navigate = useNavigate();
  const { search } = useLocation();
  const emailFromQuery = new URLSearchParams(search).get('email') ?? '';

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const verifyEmailMutation = useVerifyEmailMutation();

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

  useEffect(() => {
    if (emailFromQuery) {
      setValue('email', emailFromQuery, { shouldValidate: true });
    }
  }, [emailFromQuery, setValue]);

  const canSubmit = isValid && !isSubmitting;
  const emailValue = watch('email');

  const onSubmit = async (payload: VerifyEmailRequest): Promise<void> => {
    setError(null);
    setSuccess(null);

    try {
      await verifyEmailMutation.mutateAsync(payload);
      setSuccess('Email verified successfully! You are now signed in.');
      // Optionally, store tokens or navigate to dashboard.
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
          <div className="text-sm text-green-700 bg-green-100 p-3 rounded mb-4">{success}</div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              {...register('email', {
                required: 'Please enter a valid email address.',
                validate: (value) => isValidEmail(value) || 'Please enter a valid email address.'
              })}
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.email ? (
              <p className="mt-1 text-sm text-red-700">{errors.email.message}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Verification code</span>
            <input
              type="text"
              {...register('code', {
                required: 'Please enter the verification code.',
                validate: (value) => value.trim().length > 0 || 'Please enter the verification code.'
              })}
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.code ? (
              <p className="mt-1 text-sm text-red-700">{errors.code.message}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              {...register('password', {
                required: 'Password must be at least 8 characters and include upper/lower, number, and symbol.',
                validate: (value) =>
                  isStrongPassword(value) ||
                  'Password must be at least 8 characters and include upper/lower, number, and symbol.'
              })}
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.password ? (
              <p className="mt-1 text-sm text-red-700">{errors.password.message}</p>
            ) : null}
          </label>

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
