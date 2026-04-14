import { apiClient } from '../../../shared/api/api-client';
import { type AuthResponse, type MfaVerifyRequest, type RefreshTokenRequest, type SigninRequest, type SignoutRequest, type SignupRequest, type VerifyEmailRequest } from '../types/auth.types';

export const authService = {
    async signup(payload: SignupRequest): Promise<AuthResponse> {
        // サインアップAPI: 仮登録を作成し、検証コード送信をトリガー
        const response = await apiClient.post<AuthResponse>('/auth/signup', payload);
        return response.data;
    },

    async verifyEmail(payload: VerifyEmailRequest): Promise<AuthResponse> {
        // 検証API: コード確認後に自動サインインし、トークンまたはMFAチャレンジを受け取る
        const params = new URLSearchParams({
            email: payload.email,
            code: payload.code,
            password: payload.password
        });

        const response = await apiClient.get<AuthResponse>(`/auth/verify?${ params.toString() }`);
        return response.data;
    },

    async signin(payload: SigninRequest): Promise<AuthResponse> {
        // サインインAPI: メールとパスワードで認証し、トークンまたはMFAチャレンジを受け取る
        const response = await apiClient.post<AuthResponse>('/auth/signin', payload);
        return response.data;
    },

    async verifyMfa(payload: MfaVerifyRequest): Promise<AuthResponse> {
        // MFA検証API: メールOTPコードを検証してトークンを受け取る
        const response = await apiClient.post<AuthResponse>('/auth/mfa/verify', payload);
        return response.data;
    },

    async signout(payload: SignoutRequest): Promise<AuthResponse> {
        // グローバルサインアウトAPI: すべてのデバイスのトークンを無効化する
        const response = await apiClient.post<AuthResponse>('/auth/signout', payload);
        return response.data;
    },

    async refreshToken(payload: RefreshTokenRequest): Promise<AuthResponse> {
        // トークンリフレッシュAPI: リフレッシュトークンで新しいアクセストークンを取得する
        const response = await apiClient.post<AuthResponse>('/auth/refresh', payload);
        return response.data;
    }
};
