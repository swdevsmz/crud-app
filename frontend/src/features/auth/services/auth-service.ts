import { apiClient } from '../../../shared/api/api-client';
import { type AuthResponse, type SignupRequest, type VerifyEmailRequest } from '../types/auth.types';

export const authService = {
    async signup(payload: SignupRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/signup', payload);
        return response.data;
    },

    async verifyEmail(payload: VerifyEmailRequest): Promise<AuthResponse> {
        const params = new URLSearchParams({
            email: payload.email,
            code: payload.code,
            password: payload.password
        });

        const response = await apiClient.get<AuthResponse>(`/auth/verify?${ params.toString() }`);
        return response.data;
    }
};
