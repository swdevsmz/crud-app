import { useForm } from 'react-hook-form';

import { hasMatchingPassword, isValidEmail, isStrongPassword, isValidPhoneNumber } from '../../../shared/lib/validation';
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
      confirmPassword: '',
      phoneNumber: ''
    }
  });

  const canSubmit = isValid && !isSubmitting && !isLoading;
  const passwordValue = watch('password');

  const submit = async (payload: SignupFormValues): Promise<void> => {
    await onSubmit({
      email: payload.email,
      password: payload.password,
      phoneNumber: payload.phoneNumber
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
            required: 'メールアドレスを入力してください。',
            validate: (value) => isValidEmail(value) || 'メールアドレスの形式が正しくありません。'
          })}
        />
      </FormField>

      <PasswordInput
        id="password"
        label="Password"
        autoComplete="new-password"
        error={errors.password?.message}
        register={register('password', {
          required: 'パスワードは8文字以上で、大文字・小文字・数字・記号を含める必要があります。',
          validate: (value) =>
            isStrongPassword(value) ||
            'パスワードは8文字以上で、大文字・小文字・数字・記号を含める必要があります。'
        })}
      />

      <PasswordInput
        id="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        register={register('confirmPassword', {
          required: 'パスワードを再入力してください。',
          validate: (value) => hasMatchingPassword(passwordValue, value) || 'パスワードが一致しません。'
        })}
      />

      <FormField id="phoneNumber" label="Phone number" error={errors.phoneNumber?.message}>
        <input
          id="phoneNumber"
          type="tel"
          autoComplete="tel"
          placeholder="+819012345678"
          className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register('phoneNumber', {
            required: '電話番号を入力してください（アカウント復旧に使用します）。',
            validate: (value) =>
              isValidPhoneNumber(value) ||
              'E.164形式の電話番号を入力してください（例: +819012345678）。'
          })}
        />
      </FormField>

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-3 w-full rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting || isLoading ? '登録中…' : 'Sign up'}
      </button>
    </form>
  );
}
