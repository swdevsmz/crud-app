export interface SignupRequest {
    email: string;
    password: string;
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

export interface AuthTokens {
    accessToken: string;
    idToken: string;
    refreshToken?: string;
    expiresIn?: number;
}

export interface MfaChallenge {
    session: string;
    challengeName: string;
}

export interface MfaVerifyRequest {
    email: string;
    session: string;
    code: string;
}

export interface MfaSetupRequest {
    email: string;
    accessToken: string;
}

export interface AuthResponse {
    message: string;
    requiresVerification?: boolean;
    verified?: boolean;
    tokens?: AuthTokens;
    requiresMfaSetup?: boolean;
    mfaChallenge?: MfaChallenge;
    recoveryCodes?: string[];
}
