export interface SignupRequest {
    email: string;
    password: string;
    phoneNumber: string;
}

export interface SigninRequest {
    email: string;
    password: string;
}

export interface VerifyEmailRequest {
    email: string;
    code: string;
    password: string;
}

export interface MfaVerifyRequest {
    email: string;
    session: string;
    code: string;
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
    mfaRequired?: boolean;
    session?: string;
    email?: string;
}

export interface SignoutRequest {
    accessToken: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}
