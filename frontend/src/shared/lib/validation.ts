export function isValidEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function isStrongPassword(value: string): boolean {
  const hasMinLen = value.length >= 8;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);
  return hasMinLen && hasUpper && hasLower && hasNumber && hasSymbol;
}

export function hasMatchingPassword(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

export function isValidPhoneNumber(value: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(value);
}
