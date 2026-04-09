import { forwardRef, type InputHTMLAttributes } from 'react';

interface OtpInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * OTP（ワンタイムパスワード）入力フィールドコンポーネント
 * 6 桁の数字入力に制限
 */
export const OtpInput = forwardRef<HTMLInputElement, OtpInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
      e.target.value = value;
      props.onChange?.(e);
    };

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          placeholder="000000"
          maxLength={6}
          className={`px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest font-mono ${
            error ? 'border-red-500' : ''
          } ${className}`}
          onChange={handleChange}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

OtpInput.displayName = 'OtpInput';
