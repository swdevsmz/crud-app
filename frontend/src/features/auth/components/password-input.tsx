import { useState } from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';

import { FormField } from '../../../shared/ui/form-field';

interface PasswordInputProps {
  id: string;
  label: string;
  register: UseFormRegisterReturn;
  error?: string;
  autoComplete?: string;
}

export function PasswordInput({
  id,
  label,
  register,
  error,
  autoComplete = 'current-password'
}: PasswordInputProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <FormField id={id} label={label} error={error}>
      <div className="flex gap-2">
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          autoComplete={autoComplete}
          className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register}
        />
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
        >
          {isVisible ? '隠す' : '表示'}
        </button>
      </div>
    </FormField>
  );
}
