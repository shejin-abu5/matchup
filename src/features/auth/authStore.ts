import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * COMPARE THIS TO features/auth/authSlice.ts on the `redux-toolkit-version`
 * git branch — same responsibility (global session state), very different
 * amount of ceremony:
 *
 *   Redux Toolkit needed: a slice file, action creators, a reducer case
 *   per action, registering the reducer in app/store.ts, and typed hooks
 *   (app/hooks.ts) to read it in components.
 *
 *   Zustand needs: this one file. `create()` returns a hook you call
 *   directly in components — no <Provider> wrapper required at all.
 *
 * This is the tradeoff worth being able to explain in an interview:
 * Redux's extra structure pays for itself in large teams that want
 * every state change to go through named actions (audit trail, strict
 * conventions, middleware). Zustand skips that structure for less
 * boilerplate — fine for a small store like this one, riskier if 10
 * engineers are all writing ad-hoc `set()` calls with no conventions.
 */

export interface AuthUser {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  setCredentials: (user: AuthUser, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  // `persist` writes state to localStorage automatically and rehydrates
  // it on page load — this is a real feature, not a training exercise:
  // without it, refreshing the page would log the user out, because
  // in-memory state (Redux or Zustand, doesn't matter which) is lost
  // on reload. This is a genuine advantage of Zustand's middleware
  // system being this easy to reach for.
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setCredentials: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'matchup-auth' }
  )
)
