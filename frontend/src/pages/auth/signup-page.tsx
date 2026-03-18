import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { type SignupRequest } from '../../features/auth/api/auth';
import { useSignupMutation } from '../../features/auth/api/hooks';
import { isValidEmail, isStrongPassword } from '../../shared/lib/validation';

export default function SignupPage(): JSX.Element {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const signupMutation = useSignupMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch
  } = useForm<SignupRequest>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const canSubmit = isValid && !isSubmitting;
  const emailValue = watch('email');

  const onSubmit = async (payload: SignupRequest): Promise<void> => {
    setError(null);
    setSuccessMessage(null);

    try {
      await signupMutation.mutateAsync(payload);
      setSuccessMessage('Signup succeeded! Check your email for a verification code.');
      // Navigate to verify page, passing email so user doesn't need to re-enter.
      navigate(`/verify?email=${encodeURIComponent(payload.email)}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">Sign up</h1>

        {error ? (
          <div className="text-sm text-red-700 bg-red-100 p-3 rounded mb-4">{error}</div>
        ) : null}

        {successMessage ? (
          <div className="text-sm text-green-700 bg-green-100 p-3 rounded mb-4">{successMessage}</div>
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
            {isSubmitting ? 'Signing up…' : 'Sign up'}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          Already have a code?{' '}
          <button
            type="button"
            onClick={() => navigate(`/verify?email=${encodeURIComponent(emailValue ?? '')}`)}
            className="text-blue-600 hover:underline"
          >
            Verify your email
          </button>
          .
        </div>
      </div>
    </main>
  );
}
