import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { signup } from './authApi'
import { useAuthStore } from '../authStore'
import type { SignupFormValues } from '../schemas'

export function useSignup() {
  const navigate = useNavigate()
  const setCredentials = useAuthStore((state) => state.setCredentials)

  return useMutation({
    // RHF hands us the FULL form (including confirmPassword), but the
    // server never needs it — it only exists to validate the form
    // client-side. `{ confirmPassword, ...data }` is object destructuring:
    // it pulls confirmPassword out into its own (deliberately unused,
    // hence the leading underscore) variable, and `data` ends up holding
    // everything else. That's how we satisfy signup()'s
    // Omit<SignupFormValues, 'confirmPassword'> parameter type.
    mutationFn: ({ confirmPassword: _confirmPassword, ...data }: SignupFormValues) => signup(data),

    onSuccess: (data) => {
      setCredentials(data.user, data.token)
      navigate('/')
    },
  })
}
