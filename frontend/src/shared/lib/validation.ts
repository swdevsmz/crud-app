/** メールアドレスの形式チェック（簡易正規表現による検証）*/
export function isValidEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * パスワード強度チェック。Cognito のパスワードポリシーに合わせた条件。
 * 8文字以上、大文字・小文字・数字・記号をすべて含む必要がある。
 */
export function isStrongPassword(value: string): boolean {
  const hasMinLen = value.length >= 8;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);
  return hasMinLen && hasUpper && hasLower && hasNumber && hasSymbol;
}

/** パスワードと確認用パスワードの一致チェック */
export function hasMatchingPassword(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/** 電話番号のE.164形式チェック（例: +819012345678）*/
export function isValidPhoneNumber(value: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(value);
}
