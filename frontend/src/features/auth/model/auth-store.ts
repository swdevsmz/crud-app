import { atom } from 'jotai';

export interface AuthState {
  accessToken: string | null;
  idToken: string | null;
  isAuthenticated: boolean;
}

export const authStateAtom = atom<AuthState>({
  accessToken: null,
  idToken: null,
  isAuthenticated: false
});

export const isAuthenticatedAtom = atom((get) => get(authStateAtom).isAuthenticated);
