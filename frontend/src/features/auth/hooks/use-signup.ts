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

export function useSignup(): UseSignupResult {
    const setAuthState = useSetAtom(authStateAtom);

    const signupMutation = useMutation<AuthResponse, Error, SignupRequest>({
        mutationFn: async (payload) => {
            try {
                return await authService.signup(payload);
            } catch (error: unknown) {
                throw new Error(getApiErrorMessage(error, 'Signup failed'));
            }
        }
    });

    const verifyEmailMutation = useMutation<AuthResponse, Error, VerifyEmailRequest>({
        mutationFn: async (payload) => {
            try {
                return await authService.verifyEmail(payload);
            } catch (error: unknown) {
                throw new Error(getApiErrorMessage(error, 'Verification failed'));
            }
        },
        onSuccess: (response) => {
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
