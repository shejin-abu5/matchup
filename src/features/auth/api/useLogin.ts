import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { login } from './authApi'
import { useAuthStore } from '../authStore'
import type { LoginFormValues } from '../schemas'

/**
 * TanStack Query has two main tools:
 *   useQuery    — a fridge that restocks itself. For READING data; it fetches
 *                 automatically and keeps the result fresh. (Phase 2 uses it.)
 *   useMutation — a vending machine. For CHANGING things; nothing happens
 *                 until you press the button by calling .mutate().
 *
 * Logging in is a mutation: it only runs when someone submits the form.
 */
export function useLogin() {
  const navigate = useNavigate()

  // Selector, not destructuring `useAuthStore()` — per the project's Zustand
  // convention (see ProtectedRoute.tsx). setCredentials itself never
  // changes identity between renders, so this also avoids re-running this
  // hook's body on unrelated authStore updates.
  const setCredentials = useAuthStore((state) => state.setCredentials)

  return useMutation({
    // What the vending machine does when the button is pressed. It receives
    // whatever you pass to .mutate() in the form.
    mutationFn: (credentials: LoginFormValues) => login(credentials),

    /**
     * Runs ONLY if mutationFn finished without throwing. `data` is the
     * { user, token } that authApi.ts returned.
     *
     * This is the moment the app goes from "logged out" to "logged in":
     * setCredentials writes into the Zustand store, which every component
     * reading that store sees immediately (nav bar, ProtectedRoute, etc.).
     */
    onSuccess: (data) => {
      setCredentials(data.user, data.token)
      navigate('/')
    },

    // No onError on purpose: LoginForm reads `login.error` directly and
    // renders it, so handling it here too would just duplicate that.
  })
}
