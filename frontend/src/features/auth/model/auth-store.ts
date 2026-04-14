import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

export interface AuthState {
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
  /** アクセストークンの有効期限（Unix timestamp ms）*/
  expiresAt: number | null;
  isAuthenticated: boolean;
}

const sessionStorageAdapter = createJSONStorage<AuthState>(() => sessionStorage);

export const authStateAtom = atomWithStorage<AuthState>(
  'auth-state',
  { accessToken: null, idToken: null, refreshToken: null, expiresAt: null, isAuthenticated: false },
  sessionStorageAdapter
);

export const isAuthenticatedAtom = atom((get) => get(authStateAtom).isAuthenticated);
