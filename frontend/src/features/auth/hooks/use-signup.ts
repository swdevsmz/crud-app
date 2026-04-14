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
                throw new Error(getApiErrorMessage(error, '登録に失敗しました。'));
            }
        }
    });

    // メール検証成功時にトークンを保存し、ログイン済み状態へ更新する mutation
    // MFAが有効な場合はトークンは返却されず、MFAチャレンジ情報が返る
    const verifyEmailMutation = useMutation<AuthResponse, Error, VerifyEmailRequest>({
        mutationFn: async (payload) => {
            try {
                return await authService.verifyEmail(payload);
            } catch (error: unknown) {
                throw new Error(getApiErrorMessage(error, 'メール確認に失敗しました。'));
            }
        },
        onSuccess: (response) => {
            // MFA必要な場合はトークン未返却のため状態更新しない（呼び出し元でMFAページへリダイレクト）
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

    return {
        signupMutation,
        verifyEmailMutation
    };
}
