import { useAtomValue } from 'jotai';
import { Navigate } from 'react-router-dom';

import { isAuthenticatedAtom } from '../../features/auth/model/auth-store';

interface ProtectedRouteProps {
  children: JSX.Element;
}

/**
 * 認証済みユーザーのみアクセスできるルートラッパー。
 * 未認証の場合はサインインページへリダイレクトする。
 */
export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}
