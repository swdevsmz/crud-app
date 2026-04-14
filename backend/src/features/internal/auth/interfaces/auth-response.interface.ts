/**
 * 認証関連のレスポンスインターフェース。アクセストークン、IDトークン、リフレッシュトークンなどを含む。
 */
export interface AuthTokens {
    accessToken: string;
    idToken: string;
    refreshToken?: string;
    expiresIn?: number;
}

/**
 * 認証関連のレスポンスインターフェース。メッセージ、検証の必要性、トークンなどを含む。
 */
export interface AuthResponse {
    message: string;
    requiresVerification?: boolean;
    verified?: boolean;
    tokens?: AuthTokens;
    /** MFA（メールOTP）チャレンジが必要な場合はtrue */
    mfaRequired?: boolean;
    /** MFAチャレンジ継続用のセッショントークン */
    session?: string;
    /** MFAコード送信先のメールアドレス */
    email?: string;
}
