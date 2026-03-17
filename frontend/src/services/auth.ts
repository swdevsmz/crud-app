import { apiClient } from './api-client';

export interface SignupRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
  password: string;
}

export async function signup(payload: SignupRequest): Promise<void> {
  await apiClient.post('/auth/signup', payload);
}

export async function verifyEmail(payload: VerifyEmailRequest): Promise<unknown> {
  const params = new URLSearchParams({
    email: payload.email,
    code: payload.code,
    password: payload.password
  });

  const response = await apiClient.get(`/auth/verify?${params.toString()}`);
  return response.data;
}
