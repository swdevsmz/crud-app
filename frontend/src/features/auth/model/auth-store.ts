import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

/** 認証状態の型定義 */
export interface AuthState {
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
  /** アクセストークンの有効期限（Unix timestamp ms）*/
  expiresAt: number | null;
  isAuthenticated: boolean;
}

// sessionStorage を使うことでタブを閉じると認証状態がリセットされる
// （localStorage と異なりブラウザを閉じると消える）
const sessionStorageAdapter = createJSONStorage<AuthState>(() => sessionStorage);

/**
 * 認証状態を保持するグローバルアトム。
 * sessionStorage に永続化されるため、ページリロード後も状態が維持される。
 */
export const authStateAtom = atomWithStorage<AuthState>(
  'auth-state',
  { accessToken: null, idToken: null, refreshToken: null, expiresAt: null, isAuthenticated: false },
  sessionStorageAdapter
);

/** 認証済みかどうかを返す派生アトム（ProtectedRoute などで使用） */
export const isAuthenticatedAtom = atom((get) => get(authStateAtom).isAuthenticated);
