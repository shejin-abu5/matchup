import type { AuthUser } from '../authStore'
import type { LoginFormValues, SignupFormValues } from '../schemas'

/**
 * Shape the mock server (src/mocks/handlers.ts) sends back on success.
 * This is what a real backend's /auth/login and /auth/signup would
 * return too — user info + a token to store in Zustand.
 */
interface AuthResponse {
  user: AuthUser
  token: string
}

/**
 * Shared helper: both login and signup do the same "unwrap the fetch
 * Response" dance, so it's pulled out instead of copy-pasted twice.
 *
 * fetch() is weird: it only rejects (throws) on true network failure
 * (server unreachable, DNS broken). A 401 "wrong password" or a 409
 * "email taken" still comes back as a normal, resolved Response — you
 * have to check response.ok yourself and throw manually. If we didn't,
 * useMutation's onError would never fire for "bad password," only for
 * "the internet is down," which is the wrong behavior for a login form.
 */
async function parseAuthResponse(response: Response): Promise<AuthResponse> {
  const body = await response.json()

  if (!response.ok) {
    // body.message comes from our MSW handler, e.g. "Invalid email or password".
    // This becomes the Error that useMutation's onError receives.
    throw new Error(body.message ?? 'Something went wrong. Please try again.')
  }

  return body as AuthResponse
}

export async function login(credentials: LoginFormValues): Promise<AuthResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  return parseAuthResponse(response)
}

// Omit<SignupFormValues, 'confirmPassword'>: confirmPassword only exists to
// validate the form client-side (schemas.ts's .refine()) — the server
// never needs it, so the request body's type deliberately excludes it.
export async function signup(
  data: Omit<SignupFormValues, 'confirmPassword'>
): Promise<AuthResponse> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  return parseAuthResponse(response)
}
