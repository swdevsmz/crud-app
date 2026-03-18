export interface SignupRequest {
    email: string;
    password: string;
}

export interface VerifyEmailRequest {
    email: string;
    code: string;
    password: string;
}

export interface AuthTokens {
    accessToken: string;
    idToken: string;
    refreshToken?: string;
    expiresIn?: number;
}

export interface AuthResponse {
    message: string;
    requiresVerification?: boolean;
    verified?: boolean;
    tokens?: AuthTokens;
}
