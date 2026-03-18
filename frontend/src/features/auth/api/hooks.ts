import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import {
    signup,
    verifyEmail,
    type AuthResponse,
    type SignupRequest,
    type VerifyEmailRequest
} from './auth';
import { getApiErrorMessage } from '../../../shared/lib/api-error';

export function useSignupMutation(): UseMutationResult<AuthResponse, Error, SignupRequest> {
    return useMutation({
        mutationFn: async (payload) => {
            try {
                return await signup(payload);
            } catch (error: unknown) {
                throw new Error(getApiErrorMessage(error, 'Signup failed'));
            }
        }
    });
}

export function useVerifyEmailMutation(): UseMutationResult<AuthResponse, Error, VerifyEmailRequest> {
    return useMutation({
        mutationFn: async (payload) => {
            try {
                return await verifyEmail(payload);
            } catch (error: unknown) {
                throw new Error(getApiErrorMessage(error, 'Verification failed'));
            }
        }
    });
}
