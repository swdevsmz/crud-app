import { useForm } from 'react-hook-form';

import { hasMatchingPassword, isValidEmail, isStrongPassword } from '../../../shared/lib/validation';
import { FormField } from '../../../shared/ui/form-field';
import { type SignupRequest } from '../types/auth.types';
import { PasswordInput } from './password-input';

interface SignupFormValues extends SignupRequest {
  confirmPassword: string;
}

interface SignupFormProps {
  onSubmit: (payload: SignupRequest) => Promise<void>;
  isLoading: boolean;
  errorMessage?: string | null;
}

export function SignupForm({ onSubmit, isLoading, errorMessage }: SignupFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch
  } = useForm<SignupFormValues>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const canSubmit = isValid && !isSubmitting && !isLoading;
  const passwordValue = watch('password');

  const submit = async (payload: SignupFormValues): Promise<void> => {
    await onSubmit({
      email: payload.email,
      password: payload.password
    });
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
        autoComplete="new-password"
        error={errors.password?.message}
        register={register('password', {
          required: 'Password must be at least 8 characters and include upper/lower, number, and symbol.',
          validate: (value) =>
            isStrongPassword(value) ||
            'Password must be at least 8 characters and include upper/lower, number, and symbol.'
        })}
      />

      <PasswordInput
        id="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        register={register('confirmPassword', {
          required: 'Please confirm your password.',
          validate: (value) => hasMatchingPassword(passwordValue, value) || 'Passwords do not match.'
        })}
      />

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-3 w-full rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting || isLoading ? 'Signing up…' : 'Sign up'}
      </button>
    </form>
  );
}
