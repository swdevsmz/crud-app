import { useForm } from 'react-hook-form';

import { isValidEmail, isStrongPassword } from '../../../shared/lib/validation';
import { FormField } from '../../../shared/ui/form-field';
import { type SigninRequest } from '../types/auth.types';
import { PasswordInput } from './password-input';

interface SigninFormProps {
  onSubmit: (payload: SigninRequest) => Promise<void>;
  isLoading: boolean;
  errorMessage?: string | null;
}

export function SigninForm({ onSubmit, isLoading, errorMessage }: Readonly<SigninFormProps>): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting }
  } = useForm<SigninRequest>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const canSubmit = isValid && !isSubmitting && !isLoading;

  const submit = async (payload: SigninRequest): Promise<void> => {
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-1">
      {errorMessage ? (
        <div className="text-sm text-red-700 bg-red-100 p-3 rounded mb-4">{errorMessage}</div>
      ) : null}

      <FormField id="email" label="Email" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register('email', {
            required: 'Please enter a valid email address.',
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
          required: 'Password must be at least 8 characters and include upper/lower, number, and symbol.',
          validate: (value) =>
            isStrongPassword(value) ||
            'Password must be at least 8 characters and include upper/lower, number, and symbol.'
        })}
      />

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-3 w-full rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting || isLoading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
