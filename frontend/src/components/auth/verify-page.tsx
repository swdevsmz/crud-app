import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { verifyEmail } from '../../services/auth';
import { isValidEmail, isStrongPassword } from '../../utils/validation';

function useQueryParams(): URLSearchParams {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function VerifyPage(): JSX.Element {
  const navigate = useNavigate();
  const query = useQueryParams();

  const [email, setEmail] = useState(() => query.get('email') ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const emailFromQuery = query.get('email');
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [query]);

  const canSubmit =
    isValidEmail(email) && code.trim().length > 0 && isStrongPassword(password) && !isSubmitting;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!code.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    if (!isStrongPassword(password)) {
      setError('Password must be at least 8 characters and include upper/lower, number, and symbol.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyEmail({ email, code, password });
      setSuccess('Email verified successfully! You are now signed in.');
      // Optionally, store tokens or navigate to dashboard.
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
    } finally {
      setIsSubmitting(false);
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
            <span className="text-sm font-medium text-slate-700">Verification code</span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
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
            {isSubmitting ? 'Verifying…' : 'Verify and sign in'}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          <button
            type="button"
            onClick={() => navigate('/signup')}
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
