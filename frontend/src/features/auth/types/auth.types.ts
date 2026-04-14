/** サインアップAPIへのリクエスト */
export interface SignupRequest {
    email: string;
    password: string;
    /** アカウント復旧用の電話番号（E.164形式: +819012345678）*/
    phoneNumber: string;
}

/** サインインAPIへのリクエスト */
export interface SigninRequest {
    email: string;
    password: string;
}

/** メール検証APIへのリクエスト（サインアップ後のコード確認）*/
export interface VerifyEmailRequest {
    email: string;
    /** メールで受信した確認コード */
    code: string;
    /** 検証後に自動サインインするためのパスワード */
    password: string;
}

/** MFA（メールOTP）検証APIへのリクエスト */
export interface MfaVerifyRequest {
    email: string;
    /** Cognitoから返却されたチャレンジセッショントークン */
    session: string;
    /** メールで受信したOTPコード */
    code: string;
}

/** 認証トークンのセット */
export interface AuthTokens {
    accessToken: string;
    idToken: string;
    /** リフレッシュトークン（MFAフロー中は返却されない場合がある）*/
    refreshToken?: string;
    /** アクセストークンの有効秒数 */
    expiresIn?: number;
}

/** 認証系APIの共通レスポンス */
export interface AuthResponse {
    message: string;
    /** メール検証が必要な状態（サインアップ直後）*/
    requiresVerification?: boolean;
    /** メール検証が完了した状態 */
    verified?: boolean;
    /** 認証成功時のトークンセット */
    tokens?: AuthTokens;
    /** MFAコードの入力が必要な状態 */
    mfaRequired?: boolean;
    /** MFAチャレンジ継続に必要なCognitoセッショントークン */
    session?: string;
    /** MFAページへ引き渡すメールアドレス */
    email?: string;
}

/** グローバルサインアウトAPIへのリクエスト */
export interface SignoutRequest {
    accessToken: string;
}

/** トークンリフレッシュAPIへのリクエスト */
export interface RefreshTokenRequest {
    refreshToken: string;
}
