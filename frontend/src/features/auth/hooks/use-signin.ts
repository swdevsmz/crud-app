import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';

import { getApiErrorMessage } from '../../../shared/lib/api-error';
import { authStateAtom } from '../model/auth-store';
import { authService } from '../services/auth-service';
import { type AuthResponse, type SigninRequest } from '../types/auth.types';

interface UseSigninResult {
    signinMutation: UseMutationResult<AuthResponse, Error, SigninRequest>;
}

/**
 * カスタムフック: サインイン処理を提供
 * @returns サインインmutation
 */
export function useSignin(): UseSigninResult {
    const setAuthState = useSetAtom(authStateAtom);

    const signinMutation = useMutation<AuthResponse, Error, SigninRequest>({
        mutationFn: async (payload) => {
            try {
                return await authService.signin(payload);
            } catch (error: unknown) {
                throw new Error(getApiErrorMessage(error, 'Signin failed'));
            }
        },
        onSuccess: (response) => {
            // MFA チャレンジが返された場合
            if (response.mfaChallenge && response.mfaChallenge.session && response.mfaChallenge.challengeName) {
                setAuthState({
                    accessToken: null,
                    idToken: null,
                    isAuthenticated: false,
                    pendingMfaChallenge: {
                        session: response.mfaChallenge.session,
                        challengeName: response.mfaChallenge.challengeName,
                        email: ''
                    },
                    requiresMfaSetup: false
                });
                return;
            }

            // MFA セットアップが必要な場合（トークンはあるが、MFA未設定）
            if (response.requiresMfaSetup && response.tokens) {
                setAuthState({
                    accessToken: response.tokens.accessToken,
                    idToken: response.tokens.idToken,
                    isAuthenticated: true,
                    pendingMfaChallenge: null,
                    requiresMfaSetup: true
                });
                return;
            }

            // 通常のサインイン成功
            if (!response.tokens) {
                return;
            }

            setAuthState({
                accessToken: response.tokens.accessToken,
                idToken: response.tokens.idToken,
                isAuthenticated: true,
                pendingMfaChallenge: null,
                requiresMfaSetup: false
            });
        }
    });

    return {
        signinMutation
    };
}
