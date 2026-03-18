import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SignupForm } from '../../features/auth/components/signup-form';
import { useSignup } from '../../features/auth/hooks/use-signup';
import { type SignupRequest } from '../../features/auth/types/auth.types';
import { VerificationSuccess } from '../../features/auth/components/verification-success';

export default function SignupPage(): JSX.Element {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { signupMutation } = useSignup();

  const onSubmit = async (payload: SignupRequest): Promise<void> => {
    setError(null);
    setSuccessMessage(null);

    try {
      await signupMutation.mutateAsync(payload);
      const message = 'Signup succeeded! Check your email for a verification code.';
      setSuccessMessage(message);
      navigate(`/verify?email=${encodeURIComponent(payload.email)}`, {
        state: { signupSuccessMessage: message }
      });
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
          <VerificationSuccess message={successMessage} />
        ) : null}

        <SignupForm
          onSubmit={onSubmit}
          isLoading={signupMutation.isPending}
          errorMessage={error}
        />

        <div className="mt-4 text-sm text-slate-600">Already have a code? Verify your email from the link in your inbox.</div>
      </div>
    </main>
  );
}
