import { atom } from 'jotai';
import type { MfaChallenge } from '../types/auth.types';

export interface AuthState {
  accessToken: string | null;
  idToken: string | null;
  isAuthenticated: boolean;
  pendingMfaChallenge: (MfaChallenge & { email: string }) | null;
  requiresMfaSetup: boolean;
}

export const authStateAtom = atom<AuthState>({
  accessToken: null,
  idToken: null,
  isAuthenticated: false,
  pendingMfaChallenge: null,
  requiresMfaSetup: false
});

export const isAuthenticatedAtom = atom((get) => get(authStateAtom).isAuthenticated);
