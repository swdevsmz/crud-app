import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';

import { getApiErrorMessage } from '../../../shared/lib/api-error';
import { authStateAtom } from '../model/auth-store';
import { authService } from '../services/auth-service';
import { type AuthResponse, type MfaSetupRequest, type MfaVerifyRequest } from '../types/auth.types';

interface UseMfaVerifyResult {
    mfaVerifyMutation: UseMutationResult<AuthResponse, Error, MfaVerifyRequest>;
}

interface UseMfaSetupResult {
    mfaSetupMutation: UseMutationResult<AuthResponse, Error, MfaSetupRequest>;
}

/**
 * カスタムフック: MFA チャレンジ応答処理を提供
 * @returns MFA チャレンジ応答 mutation
 */
export function useMfaVerify(): UseMfaVerifyResult {
    const setAuthState = useSetAtom(authStateAtom);

    const mfaVerifyMutation = useMutation<AuthResponse, Error, MfaVerifyRequest>({
        mutationFn: async (payload) => {
            try {
                return await authService.verifyMfaChallenge(payload);
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
                isAuthenticated: true,
                pendingMfaChallenge: null,
                requiresMfaSetup: false
            });
        }
    });

    return {
        mfaVerifyMutation
    };
}

/**
 * カスタムフック: MFA セットアップ処理を提供
 * @returns MFA セットアップ mutation
 */
export function useMfaSetup(): UseMfaSetupResult {
    const setAuthState = useSetAtom(authStateAtom);

    const mfaSetupMutation = useMutation<AuthResponse, Error, MfaSetupRequest>({
        mutationFn: async (payload) => {
            try {
                return await authService.setupMfa(payload);
            } catch (error: unknown) {
                throw new Error(getApiErrorMessage(error, 'MFA setup failed'));
            }
        },
        onSuccess: () => {
            // セットアップ完了時は MFA セットアップフラグをクリア
            setAuthState((prev) => ({
                ...prev,
                requiresMfaSetup: false
            }));
        }
    });

    return {
        mfaSetupMutation
    };
}
