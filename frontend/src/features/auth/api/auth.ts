import { apiClient } from '../../../shared/api/api-client';

export interface SignupRequest {
  email: string;
  password: string;
  phoneNumber: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
  password: string;
}

export interface SigninRequest {
  email: string;
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

export async function signup(payload: SignupRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/signup', payload);
  return response.data;
}

export async function verifyEmail(payload: VerifyEmailRequest): Promise<AuthResponse> {
  const params = new URLSearchParams({
    email: payload.email,
    code: payload.code,
    password: payload.password
  });

  const response = await apiClient.get<AuthResponse>(`/auth/verify?${ params.toString() }`);
  return response.data;
}

export async function signin(payload: SigninRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/signin', payload);
  return response.data;
}

export async function verifyMfa(payload: MfaVerifyRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/mfa/verify', payload);
  return response.data;
}
