import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { FormField } from '../../../shared/components/FormField'
import { Button } from '../../../shared/components/Button'
import { useLogin } from '../api/useLogin'
import { loginSchema, type LoginFormValues } from '../schemas'

export function LoginForm() {
  /**
   * Same structure as SignupForm.tsx — see that file for the fuller
   * explanation of useForm / zodResolver / register.
   *
   * Short version:
   *   register     — connects an <input> to this form
   *   handleSubmit — runs Zod validation, THEN calls onSubmit if all is well
   *   errors       — validation messages, keyed by field name
   *
   * `resolver` swaps RHF's own validation for our Zod schema. RHF and Zod are
   * unrelated libraries; zodResolver is the adapter between them.
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  // The "vending machine" from useLogin.ts — nothing happens until you press
  // the button with .mutate(). It also exposes .isPending (request in flight)
  // and .error (the server rejected us).
  const login = useLogin()

  // Only reached when Zod found zero problems, so `data` is safe to trust.
  const onSubmit = (data: LoginFormValues) => {
    login.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex w-full max-w-sm flex-col gap-4">
      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        // ?. means "if there's no error here, give undefined instead of crashing"
        error={errors.email?.message}
        // register('email') returns { name, onChange, onBlur, ref }; the {...}
        // spread applies all four at once. The `ref` lets RHF read the value
        // straight off the real DOM node, so typing re-renders nothing.
        {...register('email')}
      />

      <FormField
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      {/* TWO KINDS OF ERROR, shown in two different places on purpose:

          1. Zod errors (errors.email, errors.password above) — "what you typed
             is wrong". Shown under the specific input. Never hits the network.
          2. login.error (here) — "the server said no", e.g. wrong password.
             Shown for the whole form, because it isn't about one field.

          Nothing reaches the network until kind 1 is completely clean. */}
      {login.error && (
        <p role="alert" className="text-sm text-red-600">
          {login.error.message}
        </p>
      )}

      <Button type="submit" isLoading={login.isPending}>
        Log in
      </Button>

      <p className="text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  )
}
