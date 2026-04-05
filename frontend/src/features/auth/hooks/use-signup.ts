import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';

import { getApiErrorMessage } from '../../../shared/lib/api-error';
import { authStateAtom } from '../model/auth-store';
import { authService } from '../services/auth-service';
import { type AuthResponse, type SignupRequest, type VerifyEmailRequest } from '../types/auth.types';

interface UseSignupResult {
    signupMutation: UseMutationResult<AuthResponse, Error, SignupRequest>;
    verifyEmailMutation: UseMutationResult<AuthResponse, Error, VerifyEmailRequest>;
}

/**
 * カスタムフック: サインアップおよびメール検証の処理を提供
 * 
 * @returns 
 */
export function useSignup(): UseSignupResult {
    const setAuthState = useSetAtom(authStateAtom);

    // サインアップ要求のみを扱う mutation
    const signupMutation = useMutation<AuthResponse, Error, SignupRequest>({
        mutationFn: async (payload) => {
            try {
                return await authService.signup(payload);
            } catch (error: unknown) {
                throw new Error(getApiErrorMessage(error, 'Signup failed'));
            }
        }
    });

    // メール検証成功時にトークンを保存し、ログイン済み状態へ更新する mutation
    const verifyEmailMutation = useMutation<AuthResponse, Error, VerifyEmailRequest>({
        mutationFn: async (payload) => {
            try {
                return await authService.verifyEmail(payload);
            } catch (error: unknown) {
                throw new Error(getApiErrorMessage(error, 'Verification failed'));
            }
        },
        onSuccess: (response) => {
            // トークン未返却時は状態更新しない
            if (!response.tokens) {
                return;
            }

            setAuthState({
                accessToken: response.tokens.accessToken,
                idToken: response.tokens.idToken,
                isAuthenticated: true
            });
        }
    });

    return {
        signupMutation,
        verifyEmailMutation
    };
}
