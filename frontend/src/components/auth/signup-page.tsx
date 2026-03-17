import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { signup } from '../../services/auth';
import { isValidEmail, isStrongPassword } from '../../utils/validation';

export default function SignupPage(): JSX.Element {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canSubmit = isValidEmail(email) && isStrongPassword(password) && !isSubmitting;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isStrongPassword(password)) {
      setError('Password must be at least 8 characters and include upper/lower, number, and symbol.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({ email, password });
      setSuccessMessage('Signup succeeded! Check your email for a verification code.');
      // Navigate to verify page, passing email so user doesn't need to re-enter.
      navigate(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
    } finally {
      setIsSubmitting(false);
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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
            onClick={() => navigate('/verify')}
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
