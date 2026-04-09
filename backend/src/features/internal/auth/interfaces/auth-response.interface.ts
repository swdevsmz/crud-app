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
 * MFA チャレンジの情報。Cognito がユーザーに対して MFA を要求した場合に返される。
 */
export interface MfaChallenge {
    session: string;
    challengeName: string;
}

/**
 * 認証関連のレスポンスインターフェース。メッセージ、検証の必要性、トークンなどを含む。
 */
export interface AuthResponse {
    message: string;
    requiresVerification?: boolean;
    verified?: boolean;
    tokens?: AuthTokens;
    requiresMfaSetup?: boolean;
    mfaChallenge?: MfaChallenge;
    recoveryCodes?: string[];
}
