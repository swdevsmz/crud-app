import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';

import { getApiErrorMessage } from '../../../shared/lib/api-error';
import { authStateAtom } from '../model/auth-store';
import { authService } from '../services/auth-service';
import { type AuthResponse, type MfaVerifyRequest, type SigninRequest } from '../types/auth.types';

interface UseSigninResult {
    signinMutation: UseMutationResult<AuthResponse, Error, SigninRequest>;
    mfaVerifyMutation: UseMutationResult<AuthResponse, Error, MfaVerifyRequest>;
}

/**
 * カスタムフック: サインインおよびMFA検証の処理を提供
 */
export function useSignin(): UseSigninResult {
    const setAuthState = useSetAtom(authStateAtom);

    const signinMutation = useMutation<AuthResponse, Error, SigninRequest>({
        mutationFn: async (payload) => {
            try {
                return await authService.signin(payload);
            } catch (error: unknown) {
                throw new Error(getApiErrorMessage(error, 'Sign-in failed'));
            }
        }
    });

    const mfaVerifyMutation = useMutation<AuthResponse, Error, MfaVerifyRequest>({
        mutationFn: async (payload) => {
            try {
                return await authService.verifyMfa(payload);
            } catch (error: unknown) {
                throw new Error(getApiErrorMessage(error, 'MFA verification failed'));
            }
        },
        onSuccess: (response) => {
            if (!response.tokens) {
                return;
            }
            setAuthState({
                accessToken: response.tokens.accessToken,
                idToken: response.tokens.idToken,
                refreshToken: response.tokens.refreshToken ?? null,
                expiresAt: response.tokens.expiresIn
                    ? Date.now() + response.tokens.expiresIn * 1000
                    : null,
                isAuthenticated: true
            });
        }
    });

    return { signinMutation, mfaVerifyMutation };
}
