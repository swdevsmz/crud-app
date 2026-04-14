import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';

import { authStateAtom } from '../model/auth-store';
import { authService } from '../services/auth-service';

/** アクセストークン有効期限の何ms前にリフレッシュするか（5分） */
const REFRESH_BEFORE_EXPIRY_MS = 5 * 60 * 1000;

/** トークン有効期限チェックの間隔（1分） */
const CHECK_INTERVAL_MS = 60 * 1000;

/**
 * アクセストークンの有効期限を監視し、期限切れ前に自動でリフレッシュするフック。
 * 認証済みかつ refreshToken と expiresAt が存在する場合のみ動作する。
 * リフレッシュ失敗時は認証状態をクリアしてサインインページへの遷移を促す。
 */
export function useAutoRefresh(): void {
    const [authState, setAuthState] = useAtom(authStateAtom);
    // クロージャで古い値を参照しないように ref で最新値を保持
    const authStateRef = useRef(authState);
    authStateRef.current = authState;

    useEffect(() => {
        const checkAndRefresh = async (): Promise<void> => {
            const current = authStateRef.current;

            if (!current.isAuthenticated || !current.refreshToken || !current.expiresAt) {
                return;
            }

            const timeUntilExpiry = current.expiresAt - Date.now();
            if (timeUntilExpiry > REFRESH_BEFORE_EXPIRY_MS) {
                return;
            }

            try {
                const response = await authService.refreshToken({ refreshToken: current.refreshToken });
                if (response.tokens) {
                    setAuthState({
                        accessToken: response.tokens.accessToken,
                        idToken: response.tokens.idToken,
                        refreshToken: response.tokens.refreshToken ?? current.refreshToken,
                        expiresAt: response.tokens.expiresIn
                            ? Date.now() + response.tokens.expiresIn * 1000
                            : null,
                        isAuthenticated: true
                    });
                }
            } catch {
                // リフレッシュ失敗（トークン失効など）→ 認証状態をクリア
                setAuthState({
                    accessToken: null,
                    idToken: null,
                    refreshToken: null,
                    expiresAt: null,
                    isAuthenticated: false
                });
            }
        };

        void checkAndRefresh();
        const intervalId = setInterval(() => void checkAndRefresh(), CHECK_INTERVAL_MS);
        return () => clearInterval(intervalId);
    // setAuthState は安定した参照のため deps から除外
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
