import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/authStore'

/**
 * Notice how little changed compared to the Redux version on the
 * `redux-toolkit-version` branch: swap `useAppSelector(state => state.auth.isAuthenticated)`
 * for `useAuthStore(state => state.isAuthenticated)`. Both use a
 * selector function so the component only re-renders when THIS field
 * changes, not on every store update — that pattern is identical
 * between Redux and Zustand, which is worth knowing: the selector
 * habit isn't Redux-specific, it's a general "avoid over-rendering"
 * technique that both libraries encourage.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
